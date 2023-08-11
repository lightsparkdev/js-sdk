import type InvoiceData from '../../objects/InvoiceData.js'
import type InvoiceType from "../../objects/InvoiceType.js";

export type CreatedInvoiceData = Record<InvoiceType, InvoiceData | null>
