'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export interface ImportResult {
    success: number;
    skipped: number;
    errors: string[];
}

function parseCSVRow(text: string): string[] {
    const tokens: string[] = [];

    // Simple custom csv parser to handle quotes
    let inQuotes = false;
    let currentToken = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && text[i+1] === '"') {
            currentToken += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            tokens.push(currentToken);
            currentToken = '';
        } else {
            currentToken += char;
        }
    }
    tokens.push(currentToken);
    
    return tokens.map(t => t.trim());
}

export async function importPortfolioCSV(formData: FormData): Promise<ImportResult> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Not authenticated');

    const file = formData.get('file') as File;
    if (!file) throw new Error('No file uploaded');

    const content = await file.text();
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) throw new Error('Empty CSV file');

    const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase());
    
    const codeIdx = headers.indexOf('code');
    const quantityIdx = headers.indexOf('quantity');
    const purchasePriceIdx = headers.indexOf('purchase price');
    const conditionIdx = headers.indexOf('condition');
    const languageIdx = headers.indexOf('language');
    const gradedIdx = headers.indexOf('graded');
    const gradingCompanyIdx = headers.indexOf('grading company');
    const certIdIdx = headers.indexOf('cert id');
    const forTradeIdx = headers.indexOf('for trade');
    const dateAddedIdx = headers.indexOf('date added');

    if (codeIdx === -1) {
        throw new Error('CSV must contain a "Code" column');
    }

    const result: ImportResult = {
        success: 0,
        skipped: 0,
        errors: [],
    };

    // Extract all unique codes from CSV
    const requestedCodes = new Set<string>();
    const rows = lines.slice(1).map(line => {
        const parsed = parseCSVRow(line);
        if (parsed[codeIdx]) requestedCodes.add(parsed[codeIdx]);
        return parsed;
    });

    // Fetch matching cards from DB
    const validCards = await prisma.card.findMany({
        where: { code: { in: Array.from(requestedCodes) } },
        select: { id: true, code: true }
    });

    const cardMap = new Map<string, string>();
    validCards.forEach(c => cardMap.set(c.code, c.id));

    const portfolioItemsToCreate = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < codeIdx || !row[codeIdx]) continue;
        // Skip empty summary rows
        if (row[0] === '' && row[1] === 'TOTAL') continue;

        const code = row[codeIdx];
        const cardId = cardMap.get(code);

        if (!cardId) {
            result.skipped++;
            result.errors.push(`Row ${i + 2}: Card code ${code} not found in database.`);
            continue;
        }

        const quantity = quantityIdx !== -1 ? parseInt(row[quantityIdx]) || 1 : 1;
        const purchasePrice = purchasePriceIdx !== -1 ? parseFloat(row[purchasePriceIdx]) || 0 : 0;
        
        const condition = conditionIdx !== -1 && row[conditionIdx] ? row[conditionIdx] : 'Raw';
        const language = languageIdx !== -1 && row[languageIdx] ? row[languageIdx] : 'EN';
        
        const gradedVal = gradedIdx !== -1 ? (row[gradedIdx] || '').toLowerCase() : '';
        const isGraded = gradedVal === 'yes' || gradedVal === 'true';
        const gradingCompany = gradingCompanyIdx !== -1 && row[gradingCompanyIdx] ? row[gradingCompanyIdx] : null;
        const certId = certIdIdx !== -1 && row[certIdIdx] ? row[certIdIdx] : null;

        const forTradeVal = forTradeIdx !== -1 ? (row[forTradeIdx] || '').toLowerCase() : '';
        const isForTrade = forTradeVal === 'yes' || forTradeVal === 'true';
        
        let purchasedAt = new Date();
        if (dateAddedIdx !== -1 && row[dateAddedIdx]) {
            const parsedDate = new Date(row[dateAddedIdx]);
            if (!isNaN(parsedDate.getTime())) {
                purchasedAt = parsedDate;
            }
        }

        portfolioItemsToCreate.push({
            cardId,
            userId: session.user.id,
            quantity,
            purchasePrice,
            condition,
            language,
            isGraded,
            gradingCompany,
            certId,
            isForTrade,
            purchasedAt,
        });

        result.success++;
    }

    if (portfolioItemsToCreate.length > 0) {
        await prisma.portfolioItem.createMany({
            data: portfolioItemsToCreate,
        });
    }

    revalidatePath('/app');
    revalidatePath('/app/portfolio');
    revalidatePath('/app/performance');

    return result;
}
