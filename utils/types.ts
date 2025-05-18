type Feature = {
  id: string
  property_id: string
  name: string
}

type ImageType = {
  id: string
  property_id: string
  url: string
  public_id: string
}

export type Property = {
  id: string
  type: string
  operation: string
  bathrooms: number
  bedrooms: number
  size: number
  price: number
  latitude: string
  longitude: string
  street: string
  street_number: string
  neighborhood: string
  locality: string
  province: string
  state: string
  country: string
  postal_code: string
  floor: number
  letter: string
  conservation: string
  description: string
  construction_year: number
  user_id: string
  features: Feature[]
  images: ImageType[]
}
