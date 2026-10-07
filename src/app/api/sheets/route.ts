import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LeaderboardItem {
  rank: number;
  name: string;
  score: string;
  badge?: string;
}

// Resilient CSV parser handling quotes, commas, and line breaks
function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \r\n
      }
      row.push(currentVal.trim());
      if (row.some((cell) => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((cell) => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

// Extract numeric score from string for sorting (e.g., "98.5 pts", "1,200", "$450")
function parseNumericScore(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Convert various Google Sheet URLs to CSV export endpoint
function getGoogleSheetCsvUrl(rawUrl: string, sheetGid?: string): string {
  const trimmed = rawUrl.trim();

  // If already a direct CSV or gviz link
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv') || trimmed.includes('out:csv')) {
    return trimmed;
  }

  // Standard Google Sheet URL match
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gid = sheetGid || (gidMatch ? gidMatch[1] : '0');
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  }

  // Published to web link match
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)\/pub/);
  if (pubMatch && pubMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
  }

  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      url,
      csvText,
      topCount = 5,
      sortByScore = true,
      sheetGid,
      nameColumnIndex,
      scoreColumnIndex,
    } = body || {};

    let rawCsvData = '';

    if (csvText && typeof csvText === 'string') {
      rawCsvData = csvText;
    } else if (url && typeof url === 'string') {
      const csvUrl = getGoogleSheetCsvUrl(url, sheetGid);
      
      const response = await fetch(csvUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartScreen-Engine/2.0',
          'Accept': 'text/csv, text/plain, */*',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch Google Sheet (${response.status} ${response.statusText}). Make sure the Google Sheet has link sharing enabled ('Anyone with the link can view').`,
          },
          { status: 400 }
        );
      }

      rawCsvData = await response.text();
    } else {
      return NextResponse.json(
        { error: 'Please provide either a Google Sheet URL or raw CSV data.' },
        { status: 400 }
      );
    }

    if (!rawCsvData || rawCsvData.trim().length === 0) {
      return NextResponse.json(
        { error: 'The retrieved spreadsheet was empty.' },
        { status: 400 }
      );
    }

    // Normalize literal escaped newlines if passed in JSON
    let normalizedCsv = rawCsvData;
    if (normalizedCsv.includes('\\n') && !normalizedCsv.includes('\n')) {
      normalizedCsv = normalizedCsv.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
    }

    const rows = parseCsv(normalizedCsv);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid data rows found in spreadsheet.' },
        { status: 400 }
      );
    }

    // Header inspection
    const headerRow = rows[0];
    let nameIdx = typeof nameColumnIndex === 'number' ? nameColumnIndex : -1;
    let scoreIdx = typeof scoreColumnIndex === 'number' ? scoreColumnIndex : -1;
    let badgeIdx = -1;

    if (nameIdx === -1 || scoreIdx === -1) {
      headerRow.forEach((colName, idx) => {
        const lower = colName.toLowerCase();
        if (
          nameIdx === -1 &&
          (lower.includes('team') ||
            lower.includes('name') ||
            lower.includes('participant') ||
            lower.includes('player') ||
            lower.includes('project') ||
            lower.includes('school') ||
            lower.includes('group') ||
            lower.includes('candidate'))
        ) {
          nameIdx = idx;
        } else if (
          scoreIdx === -1 &&
          (lower.includes('score') ||
            lower.includes('point') ||
            lower.includes('pts') ||
            lower.includes('total') ||
            lower.includes('mark') ||
            lower.includes('result') ||
            lower.includes('grade'))
        ) {
          scoreIdx = idx;
        } else if (badgeIdx === -1 && (lower.includes('badge') || lower.includes('status') || lower.includes('award') || lower.includes('tier'))) {
          badgeIdx = idx;
        }
      });
    }

    // Fallbacks if headers didn't match keywords or if single data row
    const hasHeaderMatch = (nameIdx !== -1 || scoreIdx !== -1);
    const dataRows = (hasHeaderMatch && rows.length > 1) ? rows.slice(1) : rows;

    if (nameIdx === -1) {
      nameIdx = 0; // Default to first column
    }
    if (scoreIdx === -1) {
      scoreIdx = headerRow.length > 1 ? 1 : 0; // Default to second column if exists
    }

    // Map rows to structured candidate items
    const parsedCandidates: { name: string; scoreStr: string; scoreNum: number; rawBadge?: string }[] = [];

    dataRows.forEach((row) => {
      const name = row[nameIdx]?.trim();
      const scoreStr = row[scoreIdx]?.trim() || '0';
      if (!name) return; // Skip empty rows

      const scoreNum = parseNumericScore(scoreStr);
      const rawBadge = badgeIdx !== -1 ? row[badgeIdx]?.trim() : undefined;

      parsedCandidates.push({
        name,
        scoreStr: scoreStr.includes('pts') || scoreStr.includes('pt') ? scoreStr : `${scoreStr} pts`,
        scoreNum,
        rawBadge,
      });
    });

    if (parsedCandidates.length === 0) {
      return NextResponse.json(
        { error: 'No team names found in the specified columns.' },
        { status: 400 }
      );
    }

    // Sort descending by score if requested
    if (sortByScore) {
      parsedCandidates.sort((a, b) => b.scoreNum - a.scoreNum);
    }

    // Slice to Top N
    const limit = Math.max(1, Math.min(Number(topCount) || 5, 50));
    const topTeams = parsedCandidates.slice(0, limit);

    // Format final leaderboard data with ranks and medals
    const leaderboardData: LeaderboardItem[] = topTeams.map((team, index) => {
      const rank = index + 1;
      let badge = team.rawBadge;

      if (!badge) {
        if (rank === 1) badge = '🥇 1st Place';
        else if (rank === 2) badge = '🥈 2nd Place';
        else if (rank === 3) badge = '🥉 3rd Place';
        else if (rank <= 5) badge = 'Top 5 Finalist';
        else badge = `Rank #${rank}`;
      }

      return {
        rank,
        name: team.name,
        score: team.scoreStr,
        badge,
      };
    });

    return NextResponse.json({
      success: true,
      totalFound: parsedCandidates.length,
      limit,
      leaderboardData,
      detectedColumns: {
        nameColumn: headerRow[nameIdx] || `Column ${nameIdx + 1}`,
        scoreColumn: headerRow[scoreIdx] || `Column ${scoreIdx + 1}`,
      },
    });
  } catch (err: unknown) {
    console.error('API /api/sheets error:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error processing spreadsheet';
    return NextResponse.json(
      { error: `Spreadsheet processing error: ${message}` },
      { status: 500 }
    );
  }
}
