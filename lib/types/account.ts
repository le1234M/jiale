export interface Account {
  id: string
  merchant_id: string
  name: string
  platform: 'douyin' | 'kuaishou' | 'xiaohongshu' | 'other'
  account_id?: string
  is_default: boolean
  form_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AccountFormData {
  category?: string
  subCategory?: string
  storeName?: string
  priceRange?: string
  sellingPoints?: string
  storeLocation?: string
  accountStage?: string
  presenter?: string
  copywritingStyle?: string[]
  benchmarkAccount?: string
  packageName?: string
  originalPrice?: string
  groupPrice?: string
  packageItems?: string
  outputTypes?: string[]
}
