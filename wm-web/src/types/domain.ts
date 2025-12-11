export type IDomainItem = {
  id?: number,
  name: string,
  description: string,

  active: boolean
  logo?: string | null,
  companyName?: string,
  firstName?: string,
  lastName?: string,
  address?: string,
  cityId?: number,
  cityName?: string,
  postalCode?: string,

  countryId?: number,
  country?: string,
  phone?: string,
  mobile?: string,
  fax?: string,
  email?: string,
  website?: string,
}
export type IDomainDataItem = {
  id?: number,
  name: string,
  description: string,
  active: boolean
  logo?: string | null,
}

export type IDomainTableFilterValue = string;

export type IDomainTableFilters = {
  name: string,
};
