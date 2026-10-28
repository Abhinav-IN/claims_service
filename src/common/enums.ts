export enum Role {
  // Might be handled alredy by basic hms so patient and doctor are useless here.
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  TPA_DESK = 'TPA_DESK',
  PMJAY_DESK = 'PMJAY_DESK',
}

export enum PayerType {
  TPA = 'TPA',
  AYUSHMAN = 'AYUSHMAN',
}

export enum CaseStatus {
  REQUESTED = 'REQUESTED',
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum PreauthStatus {
  SUBMITTED = 'SUBMITTED',
  QUERY = 'QUERY',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED',
}