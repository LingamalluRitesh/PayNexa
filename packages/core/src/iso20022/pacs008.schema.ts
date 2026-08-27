/**
 * ISO 20022 pacs.008.001.10 Financial Institutional Customer Credit Transfer Complete Schema
 */

export interface Pacs008Document {
  fitoficstmrCdtTrf: {
    grpHdr: Pacs008GroupHeader;
    cdtTrfTxInf: Pacs008CreditTransferTransaction[];
  };
}

export interface Pacs008GroupHeader {
  msgId: string;
  creDtTm: string;
  btchBookg?: boolean;
  nbOfTxs: string;
  ctrlSum?: number;
  ttlIntrBkSttlmAmt?: {
    value: number;
    ccy: string;
  };
  intrBkSttlmDt?: string;
  sttlmInf: {
    sttlmMtd: 'CLRG' | 'INDA' | 'INGA' | 'COVE';
    sttlmAcct?: {
      id: {
        iban?: string;
        othr?: { id: string; schmeNm?: { cd?: string; prtry?: string } };
      };
      tp?: { cd?: string; prtry?: string };
      ccy?: string;
    };
    clrSys?: {
      cd?: string;
      prtry?: string;
    };
  };
  pmtTpInf?: {
    instrPrty?: 'HIGH' | 'NORM';
    clrChanl?: 'RTGS' | 'RTNS' | 'MPNS' | 'BOOK';
    svclvl?: Array<{ cd?: string; prtry?: string }>;
    lclInstrm?: { cd?: string; prtry?: string };
    ctgyPurp?: { cd?: string; prtry?: string };
  };
  instgAgt?: {
    finInstnId: Pacs008FinancialInstitution;
    brnchId?: Pacs008Branch;
  };
  instdAgt?: {
    finInstnId: Pacs008FinancialInstitution;
    brnchId?: Pacs008Branch;
  };
}

export interface Pacs008CreditTransferTransaction {
  pmtId: {
    instrId?: string;
    endToEndId: string;
    txId: string;
    uetr: string; // Universal End-to-End Transaction Reference (UUIDv4)
    clrSysRef?: string;
  };
  pmtTpInf?: {
    instrPrty?: 'HIGH' | 'NORM';
    svclvl?: Array<{ cd?: string; prtry?: string }>;
    lclInstrm?: { cd?: string; prtry?: string };
    ctgyPurp?: { cd?: string; prtry?: string };
  };
  intrBkSttlmAmt: {
    value: number;
    ccy: string;
  };
  intrBkSttlmDt: string;
  sttlmPrty?: 'HIGH' | 'NORM';
  sttlmTmIndctn?: {
    dbtDtTm?: string;
    cdtDtTm?: string;
  };
  sttlmTmReq?: {
    clsTm?: string;
    tillTm?: string;
    frTm?: string;
    rjctTm?: string;
  };
  accptncDtTm?: string;
  poolgAdjstmntDt?: string;
  instdAmt?: {
    value: number;
    ccy: string;
  };
  xchgRateInf?: {
    unitCcy?: string;
    xchgRate: number;
    rateTp?: 'SPOT' | 'SALE' | 'AGRD';
    ctrctId?: string;
  };
  chrgBr: 'DEBT' | 'CRED' | 'SHAR' | 'SLEV';
  chrgsInf?: Array<{
    amt: { value: number; ccy: string };
    agt: { finInstnId: Pacs008FinancialInstitution };
  }>;
  prvsInstgAgt1?: { finInstnId: Pacs008FinancialInstitution };
  prvsInstgAgt1Acct?: Pacs008CashAccount;
  instgAgt?: { finInstnId: Pacs008FinancialInstitution };
  instdAgt?: { finInstnId: Pacs008FinancialInstitution };
  intrmyAgt1?: { finInstnId: Pacs008FinancialInstitution };
  intrmyAgt1Acct?: Pacs008CashAccount;
  intrmyAgt2?: { finInstnId: Pacs008FinancialInstitution };
  intrmyAgt2Acct?: Pacs008CashAccount;
  intrmyAgt3?: { finInstnId: Pacs008FinancialInstitution };
  intrmyAgt3Acct?: Pacs008CashAccount;
  dbtr: Pacs008Party;
  dbtrAcct: Pacs008CashAccount;
  dbtrAgt: { finInstnId: Pacs008FinancialInstitution; brnchId?: Pacs008Branch };
  dbtrAgtAcct?: Pacs008CashAccount;
  cdtrAgt: { finInstnId: Pacs008FinancialInstitution; brnchId?: Pacs008Branch };
  cdtrAgtAcct?: Pacs008CashAccount;
  cdtr: Pacs008Party;
  cdtrAcct: Pacs008CashAccount;
  ultmtCdtr?: Pacs008Party;
  purp?: { cd?: string; prtry?: string };
  rgltryRptg?: Array<{
    dbtCdtRptgInd?: 'DEBT' | 'CRED' | 'BOTH';
    authrty?: { nm?: string; ctry?: string };
    dtls?: Array<{ tp?: string; dt?: string; ctry?: string; cd?: string; amt?: { value: number; ccy: string }; inf?: string[] }>;
  }>;
  rmtInf?: {
    ustrd?: string[];
    strd?: Array<{
      rfrdDocInf?: Array<{
        tp?: { cdOrPrtry?: { cd?: string; prtry?: string } };
        nb?: string;
        rltdDt?: string;
      }>;
      rfrdDocAmt?: {
        duePyblAmt?: { value: number; ccy: string };
        dscntApldAmt?: Array<{ amt?: { value: number; ccy: string } }>;
        adjstmntAmtAndRsn?: Array<{ amt?: { value: number; ccy: string }; rsn?: string }>;
        rmtdAmt?: { value: number; ccy: string };
      };
      cdtrRefInf?: {
        tp?: { cdOrPrtry?: { cd?: string; prtry?: string }; issr?: string };
        ref?: string;
      };
      invcr?: Pacs008Party;
      invcee?: Pacs008Party;
      addtlRmtInf?: string[];
    }>;
  };
}

export interface Pacs008Party {
  nm: string;
  pstlAdr?: {
    adrTp?: { cd?: string; prtry?: string };
    dept?: string;
    subDept?: string;
    strtNm?: string;
    bldgNb?: string;
    bldgNm?: string;
    flr?: string;
    pstBx?: string;
    room?: string;
    pstCd?: string;
    twnNm: string;
    twnLctnNm?: string;
    dstrctNm?: string;
    ctrySubDvsn?: string;
    ctry: string;
    adrLine?: string[];
  };
  id?: {
    orgId?: {
      anyBIC?: string;
      lei?: string;
      othr?: Array<{ id: string; schmeNm?: { cd?: string; prtry?: string }; issr?: string }>;
    };
    prvtId?: {
      dtAndPlcOfBirth?: { birthDt: string; prvcOfBirth?: string; cityOfBirth: string; ctryOfBirth: string };
      othr?: Array<{ id: string; schmeNm?: { cd?: string; prtry?: string }; issr?: string }>;
    };
  };
  ctryOfRes?: string;
  ctctDtls?: {
    nmPrfx?: 'DOCT' | 'MADM' | 'MISS' | 'MIST' | 'MIXX';
    nm?: string;
    phneNb?: string;
    mobNb?: string;
    faxNb?: string;
    emailAdr?: string;
    emailPurp?: string;
    jobTitl?: string;
    rspnsblty?: string;
    dept?: string;
  };
}

export interface Pacs008CashAccount {
  id: {
    iban?: string;
    othr?: { id: string; schmeNm?: { cd?: string; prtry?: string }; issr?: string };
  };
  tp?: { cd?: string; prtry?: string };
  ccy?: string;
  nm?: string;
  prxy?: {
    tp?: { cd?: string; prtry?: string };
    id: string;
  };
}

export interface Pacs008FinancialInstitution {
  bicfi?: string;
  clrSysMmbId?: {
    clrSysId?: { cd?: string; prtry?: string };
    mmbId: string;
  };
  lei?: string;
  nm?: string;
  pstlAdr?: Pacs008Party['pstlAdr'];
  othr?: { id: string; schmeNm?: { cd?: string; prtry?: string }; issr?: string };
}

export interface Pacs008Branch {
  id?: string;
  lei?: string;
  nm?: string;
  pstlAdr?: Pacs008Party['pstlAdr'];
}
