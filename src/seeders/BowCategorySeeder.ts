import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { BowCategory } from '../bow-category/bow-category.entity';
import { Rule } from '../rule/rule.entity';

/**
 * Seeder for Bow Categories
 */
export class BowCategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding Bow Categories...\n');

    // Get all rules
    const ifaaRule = await em.findOne(Rule, { ruleCode: 'IFAA' });
    const fabpRule = await em.findOne(Rule, { ruleCode: 'FABP' });
    const hdhRule = await em.findOne(Rule, { ruleCode: 'HDH-IAA' });

    if (!ifaaRule) {
      console.log('❌ IFAA rule not found, skipping bow category seeding');
      return;
    }

    // Helper to determine which rule a category belongs to
    const getRuleForCategory = (ruleReference: string): Rule => {
      if (ruleReference.includes('FABP')) return fabpRule || ifaaRule;
      if (ruleReference.includes('HDH-IAA')) return hdhRule || ifaaRule;
      return ifaaRule;
    };

    // Bow Categories with multilingual descriptions
    const bowCategories = [
      {
        code: 'FU',
        name: 'Freestyle Unlimited',
        descriptionEn: 'Compound bow with unlimited accessories',
        descriptionPt: 'Arco compound com acessórios ilimitados',
        descriptionIt: 'Arco compound con accessori illimitati',
        descriptionUk: 'Блочний лук з необмеженими аксесуарами',
        descriptionEs: 'Arco compuesto con accesorios ilimitados',
        ruleReference: 'IFAA Book of Rules, Article IV, Section A',
        ruleCitation: 'Any compound bow with any accessories permitted',
      },
      {
        code: 'FSC',
        name: 'Field Sport Compound',
        descriptionEn: 'Compound bow for field archery',
        descriptionPt: 'Arco compound para tiro de campo',
        descriptionIt: 'Arco compound per tiro di campagna',
        descriptionUk: 'Блочний лук для польової стрільби',
        descriptionEs: 'Arco compuesto para tiro de campo',
        ruleReference: 'IFAA Book of Rules, Article IV, Section B',
        ruleCitation: 'Compound bow with field sport accessories',
      },
      {
        code: 'FSR',
        name: 'Field Sport Recurve',
        descriptionEn: 'Recurve bow for field archery',
        descriptionPt: 'Arco recurvo para tiro de campo',
        descriptionIt: 'Arco ricurvo per tiro di campagna',
        descriptionUk: 'Рекурсивний лук для польової стрільби',
        descriptionEs: 'Arco recurvo para tiro de campo',
        ruleReference: 'IFAA Book of Rules, Article IV, Section C',
        ruleCitation: 'Recurve bow with field sport accessories',
      },
      {
        code: 'BU',
        name: 'Bowhunter Unlimited',
        descriptionEn: 'Hunting-style compound bow',
        descriptionPt: 'Arco compound estilo caça',
        descriptionIt: 'Arco compound stile caccia',
        descriptionUk: 'Мисливський блочний лук',
        descriptionEs: 'Arco compuesto estilo caza',
        ruleReference: 'IFAA Book of Rules, Article IV, Section D',
        ruleCitation: 'Hunting-style compound bow with specific restrictions',
      },
      {
        code: 'BL',
        name: 'Bowhunter Limited',
        descriptionEn: 'Limited hunting-style recurve bow',
        descriptionPt: 'Arco recurvo estilo caça limitado',
        descriptionIt: 'Arco ricurvo stile caccia limitato',
        descriptionUk: 'Обмежений мисливський рекурсивний лук',
        descriptionEs: 'Arco recurvo estilo caza limitado',
        ruleReference: 'IFAA Book of Rules, Article IV, Section E',
        ruleCitation: 'Hunting-style recurve bow with limited accessories',
      },
      {
        code: 'BBR',
        name: 'Barebow Recurve',
        descriptionEn: 'Recurve bow without sights',
        descriptionPt: 'Arco recurvo sem miras',
        descriptionIt: 'Arco ricurvo senza mirino',
        descriptionUk: 'Рекурсивний лук без прицілу',
        descriptionEs: 'Arco recurvo sin miras',
        ruleReference: 'IFAA Book of Rules, Article IV, Section F',
        ruleCitation: 'Recurve bow shot without sights or stabilizers',
      },
      {
        code: 'BBC',
        name: 'Barebow Compound',
        descriptionEn: 'Compound bow without sights',
        descriptionPt: 'Arco compound sem miras',
        descriptionIt: 'Arco compound senza mirino',
        descriptionUk: 'Блочний лук без прицілу',
        descriptionEs: 'Arco compuesto sin miras',
        ruleReference: 'IFAA Book of Rules, Article IV, Section G',
        ruleCitation: 'Compound bow shot without sights',
      },
      {
        code: 'BHR',
        name: 'Bowhunter Historical Recurve',
        descriptionEn: 'Historical recurve bow for hunting',
        descriptionPt: 'Arco recurvo histórico para caça',
        descriptionIt: 'Arco ricurvo storico per caccia',
        descriptionUk: 'Історичний рекурсивний лук для полювання',
        descriptionEs: 'Arco recurvo histórico para caza',
        ruleReference: 'IFAA Book of Rules, Article IV, Section H',
        ruleCitation: 'Historical-style recurve bow for hunting',
      },
      {
        code: 'BHC',
        name: 'Bowhunter Historical Compound',
        descriptionEn: 'Historical compound bow for hunting',
        descriptionPt: 'Arco compound histórico para caça',
        descriptionIt: 'Arco compound storico per caccia',
        descriptionUk: 'Історичний блочний лук для полювання',
        descriptionEs: 'Arco compuesto histórico para caza',
        ruleReference: 'IFAA Book of Rules, Article IV, Section I',
        ruleCitation: 'Historical-style compound bow for hunting',
      },
      {
        code: 'TR',
        name: 'Traditional',
        descriptionEn: 'Traditional bow styles',
        descriptionPt: 'Estilos de arco tradicional',
        descriptionIt: 'Stili di arco tradizionale',
        descriptionUk: 'Традиційні стилі луків',
        descriptionEs: 'Estilos de arco tradicional',
        ruleReference: 'IFAA Book of Rules, Article IV, Section J',
        ruleCitation: 'Traditional bow without modern accessories',
      },
      {
        code: 'LB',
        name: 'Longbow',
        descriptionEn: 'Traditional longbow',
        descriptionPt: 'Arco longo tradicional',
        descriptionIt: 'Arco lungo tradizionale',
        descriptionUk: 'Традиційний довгий лук',
        descriptionEs: 'Arco largo tradicional',
        ruleReference: 'IFAA Book of Rules, Article IV, Section K',
        ruleCitation: 'Traditional longbow with D-shaped cross section',
      },
      {
        code: 'HB',
        name: 'Historical Bow',
        descriptionEn: 'Historical or traditional bow',
        descriptionPt: 'Arco histórico ou tradicional',
        descriptionIt: 'Arco storico o tradizionale',
        descriptionUk: 'Історичний або традиційний лук',
        descriptionEs: 'Arco histórico o tradicional',
        ruleReference: 'HDH-IAA Rules, Section 1',
        ruleCitation: 'Authentic historical bow reproductions',
      },
      {
        code: 'HBR',
        name: 'Historical Bow Recurve',
        descriptionEn: 'Historical recurve bow',
        descriptionPt: 'Arco recurvo histórico',
        descriptionIt: 'Arco ricurvo storico',
        descriptionUk: 'Історичний рекурсивний лук',
        descriptionEs: 'Arco recurvo histórico',
        ruleReference: 'HDH-IAA Rules, Section 2',
        ruleCitation: 'Historical recurve bow designs',
      },
      {
        code: 'MBR',
        name: 'Mediterranean Barebow Recurve',
        descriptionEn: 'Mediterranean style barebow recurve',
        descriptionPt: 'Arco recurvo estilo mediterrâneo sem miras',
        descriptionIt: 'Arco ricurvo stile mediterraneo senza mirino',
        descriptionUk: 'Середземноморський рекурсивний лук без прицілу',
        descriptionEs: 'Arco recurvo estilo mediterráneo sin miras',
        ruleReference: 'World Archery Rules, Book 4',
        ruleCitation: 'Barebow recurve with Mediterranean draw',
      },
      {
        code: 'SC-St',
        name: 'Standard Crossbow',
        descriptionEn: 'Standard crossbow',
        descriptionPt: 'Besta padrão',
        descriptionIt: 'Balestra standard',
        descriptionUk: 'Стандартний арбалет',
        descriptionEs: 'Ballesta estándar',
        ruleReference: 'FABP Rules, Section Crossbow',
        ruleCitation: 'Standard crossbow with mechanical release',
      },
      {
        code: 'SC-Fs',
        name: 'Field Sport Crossbow',
        descriptionEn: 'Field sport crossbow',
        descriptionPt: 'Besta para tiro de campo',
        descriptionIt: 'Balestra da campo',
        descriptionUk: 'Польовий арбалет',
        descriptionEs: 'Ballesta de campo',
        ruleReference: 'FABP Rules, Section Crossbow',
        ruleCitation: 'Crossbow for field archery competitions',
      },
      {
        code: 'TC',
        name: 'Traditional Crossbow',
        descriptionEn: 'Traditional crossbow',
        descriptionPt: 'Besta tradicional',
        descriptionIt: 'Balestra tradizionale',
        descriptionUk: 'Традиційний арбалет',
        descriptionEs: 'Ballesta tradicional',
        ruleReference: 'FABP Rules, Section Crossbow',
        ruleCitation: 'Traditional-style crossbow',
      },
      {
        code: 'MC',
        name: 'Modern Crossbow',
        descriptionEn: 'Modern crossbow',
        descriptionPt: 'Besta moderna',
        descriptionIt: 'Balestra moderna',
        descriptionUk: 'Сучасний арбалет',
        descriptionEs: 'Ballesta moderna',
        ruleReference: 'FABP Rules, Section Crossbow',
        ruleCitation: 'Modern crossbow with advanced accessories',
      },
      {
        code: 'HBM',
        name: 'Historical Bow Mediterranean',
        descriptionEn: 'Historical Mediterranean bow',
        descriptionPt: 'Arco mediterrâneo histórico',
        descriptionIt: 'Arco mediterraneo storico',
        descriptionUk: 'Історичний середземноморський лук',
        descriptionEs: 'Arco mediterráneo histórico',
        ruleReference: 'HDH-IAA Rules, Section Mediterranean',
        ruleCitation: 'Historical Mediterranean bow designs',
      },
      {
        code: 'HBN',
        name: 'Historical Bow Nordic',
        descriptionEn: 'Historical Nordic bow',
        descriptionPt: 'Arco nórdico histórico',
        descriptionIt: 'Arco nordico storico',
        descriptionUk: 'Історичний скандинавський лук',
        descriptionEs: 'Arco nórdico histórico',
        ruleReference: 'HDH-IAA Rules, Section Nordic',
        ruleCitation: 'Historical Nordic/Viking bow designs',
      },
      {
        code: 'HLB',
        name: 'Historical Longbow',
        descriptionEn: 'Historical longbow',
        descriptionPt: 'Arco longo histórico',
        descriptionIt: 'Arco lungo storico',
        descriptionUk: 'Історичний довгий лук',
        descriptionEs: 'Arco largo histórico',
        ruleReference: 'HDH-IAA Rules, Section Longbow',
        ruleCitation: 'Historical English/Welsh longbow',
      },
      {
        code: 'TWR',
        name: 'Traditional Wooden Recurve',
        descriptionEn: 'Traditional wooden recurve bow',
        descriptionPt: 'Arco recurvo de madeira tradicional',
        descriptionIt: 'Arco ricurvo in legno tradizionale',
        descriptionUk: "Традиційний дерев'яний рекурсивний лук",
        descriptionEs: 'Arco recurvo de madera tradicional',
        ruleReference: 'Traditional Archery Rules',
        ruleCitation: 'Wooden recurve bow without modern materials',
      },
      {
        code: 'HCB',
        name: 'Historical Composite Bow',
        descriptionEn: 'Historical composite bow',
        descriptionPt: 'Arco compósito histórico',
        descriptionIt: 'Arco composito storico',
        descriptionUk: 'Історичний композитний лук',
        descriptionEs: 'Arco compuesto histórico',
        ruleReference: 'HDH-IAA Rules, Section Composite',
        ruleCitation: 'Historical composite bow (horn, wood, sinew)',
      },
    ];

    const toPersist: BowCategory[] = [];
    for (const catData of bowCategories) {
      const existing = await em.findOne(BowCategory, { code: catData.code });
      if (!existing) {
        const rule = getRuleForCategory(catData.ruleReference);
        const bowCategory = em.create(BowCategory, {
          code: catData.code,
          name: catData.name,
          descriptionEn: catData.descriptionEn,
          descriptionPt: catData.descriptionPt,
          descriptionIt: catData.descriptionIt,
          descriptionUk: catData.descriptionUk,
          descriptionEs: catData.descriptionEs,
          ruleReference: catData.ruleReference,
          ruleCitation: catData.ruleCitation,
          rule: rule,
        });
        toPersist.push(bowCategory);
      }
    }

    await em.persistAndFlush(toPersist);
    console.log(
      `✅ ${toPersist.length} Bow Categories created (${bowCategories.length - toPersist.length} already existed)`,
    );

    console.log('\n🎉 Bow Category seeding completed!');
  }
}
