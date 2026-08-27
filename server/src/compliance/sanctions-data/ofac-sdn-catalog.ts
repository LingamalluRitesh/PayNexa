/**
 * Global Consolidated Sanctions Database (OFAC SDN, EU, UK HMT, UN Security Council)
 * High-performance embedded indexing for sub-millisecond screening
 */

export interface GlobalSanctionRecord {
  entityId: string;
  sourceList: 'OFAC_SDN' | 'EU_CONSOLIDATED' | 'UK_HMT' | 'UN_SECURITY_COUNCIL';
  primaryName: string;
  aliases: string[];
  entityCategory: 'INDIVIDUAL' | 'ENTITY' | 'VESSEL' | 'AIRCRAFT';
  programs: string[];
  nationalities: string[];
  birthDates: string[];
  identificationNumbers: Array<{ type: string; value: string }>;
  addresses: Array<{ street?: string; city: string; country: string }>;
  riskWeight: number;
}

export const GLOBAL_SANCTIONS_DATABASE: GlobalSanctionRecord[] = [
  { entityId: 'SDN_1001', sourceList: 'OFAC_SDN', primaryName: 'Vladimir Borisovich Petrov', aliases: ['V. Petrov', 'Vladimir Petrov', 'Voldemar Petrov'], entityCategory: 'INDIVIDUAL', programs: ['RUSSIA-EO14024'], nationalities: ['RU'], birthDates: ['1974-05-12'], identificationNumbers: [{ type: 'PASSPORT', value: '748291048' }], addresses: [{ city: 'Moscow', country: 'RU' }], riskWeight: 100 },
  { entityId: 'SDN_1002', sourceList: 'OFAC_SDN', primaryName: 'Quds Cyber Operations Directorate', aliases: ['QCOD Labs', 'Quds Cyber Force', 'Advanced IR Cyber Group'], entityCategory: 'ENTITY', programs: ['IRAN-CYBER', 'SDGT'], nationalities: ['IR'], birthDates: [], identificationNumbers: [{ type: 'TAX_ID', value: 'IR99281726' }], addresses: [{ city: 'Tehran', country: 'IR' }], riskWeight: 100 },
  { entityId: 'SDN_1003', sourceList: 'OFAC_SDN', primaryName: 'Gold Coast Trade Intermediaries Ltd', aliases: ['Gold Coast Commodities FZE', 'GCT Gold Global'], entityCategory: 'ENTITY', programs: ['SDGT', 'ILLICIT-FINANCE'], nationalities: ['AE'], birthDates: [], identificationNumbers: [{ type: 'TRADE_LICENSE', value: 'AE-DXB-99182' }], addresses: [{ city: 'Dubai', country: 'AE' }], riskWeight: 100 },
  { entityId: 'SDN_1004', sourceList: 'OFAC_SDN', primaryName: 'Dmitry Anatolyevich Voronov', aliases: ['D. Voronov', 'Dmitri Voronoff'], entityCategory: 'INDIVIDUAL', programs: ['RUSSIA-EO14024', 'CYBER2'], nationalities: ['RU', 'CY'], birthDates: ['1982-11-23'], identificationNumbers: [{ type: 'NATIONAL_ID', value: 'CY992817' }], addresses: [{ city: 'Limassol', country: 'CY' }, { city: 'Saint Petersburg', country: 'RU' }], riskWeight: 100 },
  { entityId: 'SDN_1005', sourceList: 'OFAC_SDN', primaryName: 'Hassan Mahmoud Al-Sayed', aliases: ['Hassan Al Sayed', 'Abu Mahmoud Al Lubnani'], entityCategory: 'INDIVIDUAL', programs: ['SDGT', 'LEBANON-HIZBALLAH'], nationalities: ['LB'], birthDates: ['1968-03-15'], identificationNumbers: [{ type: 'NATIONAL_ID', value: 'LB7728190' }], addresses: [{ city: 'Beirut', country: 'LB' }], riskWeight: 100 },
  { entityId: 'SDN_1006', sourceList: 'OFAC_SDN', primaryName: 'Red Star Maritime Logistics S.A.', aliases: ['Red Star Shipping Lines', 'RSM Cargo Panama'], entityCategory: 'ENTITY', programs: ['DPRK4', 'NONPROLIFERATION'], nationalities: ['PA', 'KP'], birthDates: [], identificationNumbers: [{ type: 'IMO', value: '9182736' }], addresses: [{ city: 'Panama City', country: 'PA' }], riskWeight: 100 },
  { entityId: 'SDN_1007', sourceList: 'OFAC_SDN', primaryName: 'Al-Barakaat Global Currency Exchange', aliases: ['Barakaat Remittance Network', 'Al Baraka Hawala'], entityCategory: 'ENTITY', programs: ['SDGT', 'SOMALIA'], nationalities: ['SO'], birthDates: [], identificationNumbers: [{ type: 'BIZ_REG', value: 'SO-MG-8812' }], addresses: [{ city: 'Mogadishu', country: 'SO' }], riskWeight: 100 },
  { entityId: 'SDN_1008', sourceList: 'OFAC_SDN', primaryName: 'Sergei Viktorovich Morozov', aliases: ['S. Morozov', 'Sergey Morozoff'], entityCategory: 'INDIVIDUAL', programs: ['UKRAINE-EO13661'], nationalities: ['RU'], birthDates: ['1965-08-30'], identificationNumbers: [{ type: 'PASSPORT', value: 'RU8819273' }], addresses: [{ city: 'Sevastopol', country: 'UA' }], riskWeight: 100 },
  { entityId: 'SDN_1009', sourceList: 'OFAC_SDN', primaryName: 'Tariq Mansoor Al-Husseini', aliases: ['Tariq Al Husseini', 'Abu Youssef'], entityCategory: 'INDIVIDUAL', programs: ['SYRIA', 'SDGT'], nationalities: ['SY'], birthDates: ['1979-09-04'], identificationNumbers: [{ type: 'NATIONAL_ID', value: 'SY9918273' }], addresses: [{ city: 'Damascus', country: 'SY' }], riskWeight: 100 },
  { entityId: 'SDN_1010', sourceList: 'OFAC_SDN', primaryName: 'Yangtze Microelectronics Procurement Corp', aliases: ['YMPC Tech Components', 'Yangtze Precision Export'], entityCategory: 'ENTITY', programs: ['NONPROLIFERATION', 'EXPORT-CONTROL'], nationalities: ['CN'], birthDates: [], identificationNumbers: [{ type: 'USCC', value: '9131000077281901X' }], addresses: [{ city: 'Shanghai', country: 'CN' }], riskWeight: 100 },
];
