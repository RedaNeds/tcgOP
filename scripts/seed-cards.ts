
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CARDS = [
    // ═══════════════════════════════════════════════════════
    // ROMANCE DAWN (OP01) — 20 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP01-001', code: 'OP01-001', name: 'Roronoa Zoro', set: 'Romance Dawn', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-001.png', currentPrice: 0.50, color: 'Red', type: 'Leader', power: 5000, attribute: 'Slash' },
    { id: 'OP01-002', code: 'OP01-002', name: 'Trafalgar Law', set: 'Romance Dawn', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-002.png', currentPrice: 0.45, color: 'Red/Green', type: 'Leader', power: 5000, attribute: 'Slash' },
    { id: 'OP01-003', code: 'OP01-003', name: 'Kaido', set: 'Romance Dawn', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-003.png', currentPrice: 0.35, color: 'Purple', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP01-004', code: 'OP01-004', name: 'Monkey.D.Luffy', set: 'Romance Dawn', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-004.png', currentPrice: 0.25, color: 'Red/Green', type: 'Leader', power: 5000, attribute: 'Strike' },
    { id: 'OP01-006', code: 'OP01-006', name: 'Shanks', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-006.png', currentPrice: 3.20, color: 'Red', type: 'Character', power: 6000, attribute: 'Slash' },
    { id: 'OP01-008', code: 'OP01-008', name: 'Dracule Mihawk', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-008.png', currentPrice: 2.80, color: 'Red', type: 'Character', power: 7000, attribute: 'Slash' },
    { id: 'OP01-013', code: 'OP01-013', name: 'Sanji', set: 'Romance Dawn', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-013.png', currentPrice: 0.75, color: 'Red', type: 'Character', power: 4000, attribute: 'Strike' },
    { id: 'OP01-016', code: 'OP01-016', name: 'Nami', set: 'Romance Dawn', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-016.png', currentPrice: 12.50, color: 'Red', type: 'Character', power: 2000, attribute: 'Special' },
    { id: 'OP01-017', code: 'OP01-017', name: 'Usopp', set: 'Romance Dawn', rarity: 'C', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-017.png', currentPrice: 0.10, color: 'Red', type: 'Character', power: 2000, attribute: 'Ranged' },
    { id: 'OP01-020', code: 'OP01-020', name: 'Tony Tony.Chopper', set: 'Romance Dawn', rarity: 'C', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-020.png', currentPrice: 0.15, color: 'Red', type: 'Character', power: 1000, attribute: 'Strike' },
    { id: 'OP01-024', code: 'OP01-024', name: 'Nico Robin', set: 'Romance Dawn', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-024.png', currentPrice: 1.50, color: 'Red', type: 'Character', power: 3000, attribute: 'Special' },
    { id: 'OP01-025', code: 'OP01-025', name: 'Roronoa Zoro', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-025.png', currentPrice: 18.00, color: 'Red', type: 'Character', power: 5000, attribute: 'Slash' },
    { id: 'OP01-029', code: 'OP01-029', name: 'Jinbe', set: 'Romance Dawn', rarity: 'UC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-029.png', currentPrice: 0.20, color: 'Blue', type: 'Character', power: 4000, attribute: 'Strike' },
    { id: 'OP01-035', code: 'OP01-035', name: 'Brook', set: 'Romance Dawn', rarity: 'UC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-035.png', currentPrice: 0.25, color: 'Blue', type: 'Character', power: 3000, attribute: 'Slash' },
    { id: 'OP01-040', code: 'OP01-040', name: 'Crocodile', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-040.png', currentPrice: 4.50, color: 'Blue', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP01-047', code: 'OP01-047', name: 'Boa Hancock', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-047.png', currentPrice: 6.20, color: 'Green', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP01-051', code: 'OP01-051', name: 'Eustass"Captain"Kid', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-051.png', currentPrice: 2.30, color: 'Green', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP01-060', code: 'OP01-060', name: 'Donquixote Doflamingo', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-060.png', currentPrice: 5.10, color: 'Blue', type: 'Character', power: 8000, attribute: 'Special' },
    { id: 'OP01-070', code: 'OP01-070', name: 'Charlotte Linlin', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-070.png', currentPrice: 3.80, color: 'Yellow', type: 'Character', power: 8000, attribute: 'Special' },
    { id: 'OP01-078', code: 'OP01-078', name: 'Yamato', set: 'Romance Dawn', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-078.png', currentPrice: 7.50, color: 'Green', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP01-120', code: 'OP01-120', name: 'Shanks (Manga)', set: 'Romance Dawn', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-120.png', currentPrice: 85.00, color: 'Red', type: 'Character', power: 9000, attribute: 'Slash' },

    // ═══════════════════════════════════════════════════════
    // PARAMOUNT WAR (OP02) — 15 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP02-001', code: 'OP02-001', name: 'Edward.Newgate', set: 'Paramount War', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-001.png', currentPrice: 0.80, color: 'Red', type: 'Leader', power: 6000, attribute: 'Special' },
    { id: 'OP02-002', code: 'OP02-002', name: 'Buggy', set: 'Paramount War', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-002.png', currentPrice: 0.30, color: 'Red/Blue', type: 'Leader', power: 5000, attribute: 'Slash' },
    { id: 'OP02-004', code: 'OP02-004', name: 'Edward.Newgate', set: 'Paramount War', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-004.png', currentPrice: 1.50, color: 'Red', type: 'Character', power: 8000, attribute: 'Special' },
    { id: 'OP02-013', code: 'OP02-013', name: 'Portgas.D.Ace', set: 'Paramount War', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-013.png', currentPrice: 5.20, color: 'Red', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP02-018', code: 'OP02-018', name: 'Monkey.D.Garp', set: 'Paramount War', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-018.png', currentPrice: 1.20, color: 'Red', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP02-025', code: 'OP02-025', name: 'Akainu', set: 'Paramount War', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-025.png', currentPrice: 3.90, color: 'Red', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP02-030', code: 'OP02-030', name: 'Kizaru', set: 'Paramount War', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-030.png', currentPrice: 0.90, color: 'Yellow', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP02-036', code: 'OP02-036', name: 'Aokiji', set: 'Paramount War', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-036.png', currentPrice: 4.10, color: 'Blue', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP02-041', code: 'OP02-041', name: 'Boa Hancock', set: 'Paramount War', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-041.png', currentPrice: 1.80, color: 'Green', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP02-049', code: 'OP02-049', name: 'Sengoku', set: 'Paramount War', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-049.png', currentPrice: 2.60, color: 'Black', type: 'Character', power: 6000, attribute: 'Special' },
    { id: 'OP02-058', code: 'OP02-058', name: 'Marco', set: 'Paramount War', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-058.png', currentPrice: 1.40, color: 'Yellow', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP02-062', code: 'OP02-062', name: 'Ivankov', set: 'Paramount War', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-062.png', currentPrice: 0.65, color: 'Purple', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP02-085', code: 'OP02-085', name: 'Monkey.D.Luffy', set: 'Paramount War', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-085.png', currentPrice: 8.50, color: 'Red', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP02-114', code: 'OP02-114', name: 'Portgas.D.Ace (Alt Art)', set: 'Paramount War', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-114.png', currentPrice: 120.00, color: 'Red', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP02-120', code: 'OP02-120', name: 'Edward.Newgate (Manga)', set: 'Paramount War', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP02/OP02-120.png', currentPrice: 95.00, color: 'Red', type: 'Character', power: 8000, attribute: 'Special' },

    // ═══════════════════════════════════════════════════════
    // PILLARS OF STRENGTH (OP03) — 15 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP03-001', code: 'OP03-001', name: 'Portgas.D.Ace', set: 'Pillars of Strength', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-001.png', currentPrice: 0.35, color: 'Red/Yellow', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP03-003', code: 'OP03-003', name: 'Charlotte Katakuri', set: 'Pillars of Strength', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-003.png', currentPrice: 0.55, color: 'Yellow', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP03-008', code: 'OP03-008', name: 'Kaido', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-008.png', currentPrice: 6.30, color: 'Purple', type: 'Character', power: 9000, attribute: 'Strike' },
    { id: 'OP03-013', code: 'OP03-013', name: 'Queen', set: 'Pillars of Strength', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-013.png', currentPrice: 0.80, color: 'Purple', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP03-022', code: 'OP03-022', name: 'King', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-022.png', currentPrice: 3.60, color: 'Purple', type: 'Character', power: 7000, attribute: 'Slash' },
    { id: 'OP03-030', code: 'OP03-030', name: 'Rob Lucci', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-030.png', currentPrice: 4.20, color: 'Black', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP03-040', code: 'OP03-040', name: 'Nami', set: 'Pillars of Strength', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-040.png', currentPrice: 0.60, color: 'Blue/Purple', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP03-044', code: 'OP03-044', name: 'Vinsmoke Reiju', set: 'Pillars of Strength', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-044.png', currentPrice: 1.10, color: 'Blue', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP03-054', code: 'OP03-054', name: 'Sanji', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-054.png', currentPrice: 5.80, color: 'Blue', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP03-058', code: 'OP03-058', name: 'Zoro', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-058.png', currentPrice: 7.40, color: 'Green', type: 'Character', power: 7000, attribute: 'Slash' },
    { id: 'OP03-070', code: 'OP03-070', name: 'Charlotte Pudding', set: 'Pillars of Strength', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-070.png', currentPrice: 1.30, color: 'Yellow', type: 'Character', power: 3000, attribute: 'Special' },
    { id: 'OP03-076', code: 'OP03-076', name: 'Charlotte Katakuri', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-076.png', currentPrice: 9.60, color: 'Yellow', type: 'Character', power: 8000, attribute: 'Special' },
    { id: 'OP03-089', code: 'OP03-089', name: 'Monkey.D.Luffy', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-089.png', currentPrice: 6.90, color: 'Green', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP03-092', code: 'OP03-092', name: 'Yamato', set: 'Pillars of Strength', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-092.png', currentPrice: 11.00, color: 'Green', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP03-112', code: 'OP03-112', name: 'Charlotte Katakuri (Manga)', set: 'Pillars of Strength', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP03/OP03-112.png', currentPrice: 75.00, color: 'Yellow', type: 'Character', power: 8000, attribute: 'Special' },

    // ═══════════════════════════════════════════════════════
    // KINGDOMS OF INTRIGUE (OP04) — 15 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP04-001', code: 'OP04-001', name: 'Queen', set: 'Kingdoms of Intrigue', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-001.png', currentPrice: 0.40, color: 'Blue/Black', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP04-002', code: 'OP04-002', name: 'Uta', set: 'Kingdoms of Intrigue', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-002.png', currentPrice: 0.60, color: 'Red/Purple', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP04-010', code: 'OP04-010', name: 'Sabo', set: 'Kingdoms of Intrigue', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-010.png', currentPrice: 1.50, color: 'Green', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP04-019', code: 'OP04-019', name: 'Rebecca', set: 'Kingdoms of Intrigue', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-019.png', currentPrice: 0.90, color: 'Yellow', type: 'Character', power: 3000, attribute: 'Special' },
    { id: 'OP04-024', code: 'OP04-024', name: 'Issho (Fujitora)', set: 'Kingdoms of Intrigue', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-024.png', currentPrice: 5.80, color: 'Purple', type: 'Character', power: 7000, attribute: 'Slash' },
    { id: 'OP04-031', code: 'OP04-031', name: 'Donquixote Doflamingo', set: 'Kingdoms of Intrigue', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-031.png', currentPrice: 4.50, color: 'Green', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP04-044', code: 'OP04-044', name: 'Monkey.D.Luffy', set: 'Kingdoms of Intrigue', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-044.png', currentPrice: 14.50, color: 'Blue', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP04-056', code: 'OP04-056', name: 'Yamato', set: 'Kingdoms of Intrigue', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-056.png', currentPrice: 2.10, color: 'Green', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP04-062', code: 'OP04-062', name: 'Vinsmoke Sanji', set: 'Kingdoms of Intrigue', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-062.png', currentPrice: 1.70, color: 'Blue', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP04-070', code: 'OP04-070', name: 'Cavendish', set: 'Kingdoms of Intrigue', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-070.png', currentPrice: 0.85, color: 'Green', type: 'Character', power: 4000, attribute: 'Slash' },
    { id: 'OP04-083', code: 'OP04-083', name: 'Sabo', set: 'Kingdoms of Intrigue', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-083.png', currentPrice: 8.90, color: 'Black', type: 'Character', power: 6000, attribute: 'Special' },
    { id: 'OP04-090', code: 'OP04-090', name: 'Nico Robin', set: 'Kingdoms of Intrigue', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-090.png', currentPrice: 2.40, color: 'Purple', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP04-100', code: 'OP04-100', name: 'Trafalgar Law', set: 'Kingdoms of Intrigue', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-100.png', currentPrice: 10.50, color: 'Black', type: 'Character', power: 6000, attribute: 'Slash' },
    { id: 'OP04-112', code: 'OP04-112', name: 'Yamato (Alt Art)', set: 'Kingdoms of Intrigue', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-112.png', currentPrice: 55.00, color: 'Green', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP04-118', code: 'OP04-118', name: 'Sabo (Manga)', set: 'Kingdoms of Intrigue', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP04/OP04-118.png', currentPrice: 68.00, color: 'Black', type: 'Character', power: 6000, attribute: 'Special' },

    // ═══════════════════════════════════════════════════════
    // AWAKENING OF THE NEW ERA (OP05) — 15 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP05-001', code: 'OP05-001', name: 'Sabo', set: 'Awakening of the New Era', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-001.png', currentPrice: 0.40, color: 'Red/Black', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP05-002', code: 'OP05-002', name: 'Enel', set: 'Awakening of the New Era', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-002.png', currentPrice: 0.55, color: 'Yellow', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP05-007', code: 'OP05-007', name: 'Monkey.D.Dragon', set: 'Awakening of the New Era', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-007.png', currentPrice: 4.80, color: 'Red', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP05-015', code: 'OP05-015', name: 'Shanks', set: 'Awakening of the New Era', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-015.png', currentPrice: 7.20, color: 'Red', type: 'Character', power: 8000, attribute: 'Slash' },
    { id: 'OP05-022', code: 'OP05-022', name: 'Crocodile', set: 'Awakening of the New Era', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-022.png', currentPrice: 0.95, color: 'Blue', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP05-030', code: 'OP05-030', name: 'Trafalgar Law', set: 'Awakening of the New Era', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-030.png', currentPrice: 11.20, color: 'Black', type: 'Character', power: 6000, attribute: 'Slash' },
    { id: 'OP05-041', code: 'OP05-041', name: 'Nico Robin', set: 'Awakening of the New Era', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-041.png', currentPrice: 1.60, color: 'Purple', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP05-051', code: 'OP05-051', name: 'Koby', set: 'Awakening of the New Era', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-051.png', currentPrice: 3.40, color: 'Yellow', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP05-060', code: 'OP05-060', name: 'Monkey.D.Luffy', set: 'Awakening of the New Era', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-060.png', currentPrice: 0.25, color: 'Purple', type: 'Leader', power: 5000, attribute: 'Strike' },
    { id: 'OP05-069', code: 'OP05-069', name: 'Enel', set: 'Awakening of the New Era', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-069.png', currentPrice: 6.50, color: 'Yellow', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP05-074', code: 'OP05-074', name: 'Jewelry Bonney', set: 'Awakening of the New Era', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-074.png', currentPrice: 2.30, color: 'Green', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP05-091', code: 'OP05-091', name: 'Rob Lucci', set: 'Awakening of the New Era', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-091.png', currentPrice: 5.60, color: 'Black', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP05-100', code: 'OP05-100', name: 'Nami', set: 'Awakening of the New Era', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-100.png', currentPrice: 1.90, color: 'Blue', type: 'Character', power: 3000, attribute: 'Special' },
    { id: 'OP05-119', code: 'OP05-119', name: 'Monkey.D.Luffy (Manga)', set: 'Awakening of the New Era', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-119.png', currentPrice: 1500.00, color: 'Purple', type: 'Character', power: 10000, attribute: 'Strike' },
    { id: 'OP05-120', code: 'OP05-120', name: 'Sabo (Alt Art)', set: 'Awakening of the New Era', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP05/OP05-120.png', currentPrice: 180.00, color: 'Red', type: 'Character', power: 7000, attribute: 'Special' },

    // ═══════════════════════════════════════════════════════
    // TWIN CHAMPIONS (OP06) — 12 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP06-001', code: 'OP06-001', name: 'Sakazuki', set: 'Twin Champions', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-001.png', currentPrice: 0.70, color: 'Black', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'OP06-013', code: 'OP06-013', name: 'Perona', set: 'Twin Champions', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-013.png', currentPrice: 4.30, color: 'Purple', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP06-020', code: 'OP06-020', name: 'Gecko Moria', set: 'Twin Champions', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-020.png', currentPrice: 3.50, color: 'Purple', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP06-035', code: 'OP06-035', name: 'Hody Jones', set: 'Twin Champions', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-035.png', currentPrice: 0.75, color: 'Blue', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP06-043', code: 'OP06-043', name: 'Monkey.D.Luffy', set: 'Twin Champions', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-043.png', currentPrice: 12.80, color: 'Green', type: 'Character', power: 6000, attribute: 'Strike' },
    { id: 'OP06-058', code: 'OP06-058', name: 'Sakazuki', set: 'Twin Champions', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-058.png', currentPrice: 8.40, color: 'Black', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP06-069', code: 'OP06-069', name: 'Koby', set: 'Twin Champions', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-069.png', currentPrice: 1.90, color: 'Yellow', type: 'Character', power: 4000, attribute: 'Strike' },
    { id: 'OP06-079', code: 'OP06-079', name: 'Rebecca', set: 'Twin Champions', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-079.png', currentPrice: 1.20, color: 'Yellow', type: 'Character', power: 3000, attribute: 'Special' },
    { id: 'OP06-086', code: 'OP06-086', name: 'Smoker', set: 'Twin Champions', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-086.png', currentPrice: 5.70, color: 'Blue', type: 'Character', power: 6000, attribute: 'Special' },
    { id: 'OP06-101', code: 'OP06-101', name: 'Roronoa Zoro', set: 'Twin Champions', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-101.png', currentPrice: 15.00, color: 'Green', type: 'Character', power: 7000, attribute: 'Slash' },
    { id: 'OP06-116', code: 'OP06-116', name: 'Luffy (Gear 5)', set: 'Twin Champions', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-116.png', currentPrice: 250.00, color: 'Green', type: 'Character', power: 8000, attribute: 'Strike' },
    { id: 'OP06-118', code: 'OP06-118', name: 'Yamato (Alt Art)', set: 'Twin Champions', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP06/OP06-118.png', currentPrice: 45.00, color: 'Green', type: 'Character', power: 5000, attribute: 'Strike' },

    // ═══════════════════════════════════════════════════════
    // 500 YEARS IN THE FUTURE (OP07) — 10 cards
    // ═══════════════════════════════════════════════════════
    { id: 'OP07-001', code: 'OP07-001', name: 'Monkey.D.Luffy', set: '500 Years in the Future', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-001.png', currentPrice: 0.65, color: 'Red/Purple', type: 'Leader', power: 5000, attribute: 'Strike' },
    { id: 'OP07-015', code: 'OP07-015', name: 'Shanks', set: '500 Years in the Future', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-015.png', currentPrice: 9.80, color: 'Red', type: 'Character', power: 8000, attribute: 'Slash' },
    { id: 'OP07-026', code: 'OP07-026', name: 'Boa Hancock', set: '500 Years in the Future', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-026.png', currentPrice: 6.80, color: 'Green', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP07-038', code: 'OP07-038', name: 'Vegapunk', set: '500 Years in the Future', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-038.png', currentPrice: 4.20, color: 'Blue', type: 'Character', power: 5000, attribute: 'Special' },
    { id: 'OP07-045', code: 'OP07-045', name: 'Rob Lucci', set: '500 Years in the Future', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-045.png', currentPrice: 7.90, color: 'Black', type: 'Character', power: 7000, attribute: 'Strike' },
    { id: 'OP07-056', code: 'OP07-056', name: 'Bonney', set: '500 Years in the Future', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-056.png', currentPrice: 2.30, color: 'Yellow', type: 'Character', power: 4000, attribute: 'Special' },
    { id: 'OP07-064', code: 'OP07-064', name: 'Kuma', set: '500 Years in the Future', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-064.png', currentPrice: 5.50, color: 'Purple', type: 'Character', power: 7000, attribute: 'Special' },
    { id: 'OP07-079', code: 'OP07-079', name: 'Jinbe', set: '500 Years in the Future', rarity: 'R', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-079.png', currentPrice: 1.80, color: 'Blue', type: 'Character', power: 5000, attribute: 'Strike' },
    { id: 'OP07-109', code: 'OP07-109', name: 'Monkey.D.Luffy (Gear 5 Alt)', set: '500 Years in the Future', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-109.png', currentPrice: 320.00, color: 'Purple', type: 'Character', power: 9000, attribute: 'Strike' },
    { id: 'OP07-118', code: 'OP07-118', name: 'Rob Lucci (Alt Art)', set: '500 Years in the Future', rarity: 'SEC', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP07/OP07-118.png', currentPrice: 42.00, color: 'Black', type: 'Character', power: 7000, attribute: 'Strike' },

    // ═══════════════════════════════════════════════════════
    // STARTER DECKS — 8 cards
    // ═══════════════════════════════════════════════════════
    { id: 'ST01-001', code: 'ST01-001', name: 'Monkey.D.Luffy', set: 'Straw Hat Crew', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST01/ST01-001.png', currentPrice: 0.20, color: 'Red', type: 'Leader', power: 5000, attribute: 'Strike' },
    { id: 'ST01-012', code: 'ST01-012', name: 'Roronoa Zoro', set: 'Straw Hat Crew', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST01/ST01-012.png', currentPrice: 3.50, color: 'Red', type: 'Character', power: 5000, attribute: 'Slash' },
    { id: 'ST02-001', code: 'ST02-001', name: 'Edward.Newgate', set: 'Worst Generation', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST02/ST02-001.png', currentPrice: 0.30, color: 'Green', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'ST03-001', code: 'ST03-001', name: 'Charlotte Linlin', set: 'The Seven Warlords', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST03/ST03-001.png', currentPrice: 0.30, color: 'Blue', type: 'Leader', power: 5000, attribute: 'Special' },
    { id: 'ST05-001', code: 'ST05-001', name: 'Monkey.D.Luffy', set: 'Film Edition', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST05/ST05-001.png', currentPrice: 0.25, color: 'Red', type: 'Leader', power: 5000, attribute: 'Strike' },
    { id: 'ST10-001', code: 'ST10-001', name: 'Monkey.D.Luffy', set: 'The Three Captains', rarity: 'L', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST10/ST10-001.png', currentPrice: 0.35, color: 'Red/Green/Purple', type: 'Leader', power: 5000, attribute: 'Strike' },
    { id: 'ST10-010', code: 'ST10-010', name: 'Trafalgar Law', set: 'The Three Captains', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST10/ST10-010.png', currentPrice: 4.20, color: 'Green', type: 'Character', power: 5000, attribute: 'Slash' },
    { id: 'ST10-013', code: 'ST10-013', name: 'Eustass"Captain"Kid', set: 'The Three Captains', rarity: 'SR', image: 'https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/ST10/ST10-013.png', currentPrice: 2.10, color: 'Purple', type: 'Character', power: 6000, attribute: 'Special' },
];

async function main() {
    console.log(`Seeding ${CARDS.length} cards...`);

    let created = 0;
    let updated = 0;

    for (const card of CARDS) {
        const result = await prisma.card.upsert({
            where: { id: card.id },
            update: {
                currentPrice: card.currentPrice,
                color: card.color,
                type: card.type,
                power: card.power,
                attribute: card.attribute,
                image: card.image,
                name: card.name,
                set: card.set,
                rarity: card.rarity,
            },
            create: {
                id: card.id,
                code: card.code,
                name: card.name,
                set: card.set,
                rarity: card.rarity,
                image: card.image,
                currentPrice: card.currentPrice,
                color: card.color,
                type: card.type,
                power: card.power,
                attribute: card.attribute,
            },
        });

        // Check if there's already price history for this card
        const existingHistory = await prisma.priceHistory.findFirst({
            where: { cardId: card.id },
        });

        if (!existingHistory) {
            await prisma.priceHistory.create({
                data: {
                    cardId: card.id,
                    price: card.currentPrice,
                    date: new Date(),
                }
            });
            created++;
        } else {
            updated++;
        }
    }

    console.log(`✅ Seeding complete: ${created} new cards, ${updated} updated.`);
    console.log(`   Total cards in DB: ${await prisma.card.count()}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
