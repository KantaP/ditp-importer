export interface Processing {
    currentStep? : number;
}

export interface Country {
    cou_code?: number;
    name?: string
}

export interface Business {
    bus_id?: number;
    bus_type?: string;
}


export interface Category {
    main?: number;
    sub?: Array<Array<number>>
}

export interface Company {
    com_logo?: string;
    com_lattitude?: string;
    com_longitude?: string;
    com_name_en?: string;
    com_address_en?: string;
    cou_code?: number;
    com_street_en?: string;
    com_city_en?: string;
    com_state_en?: string;
    com_sub_state_en?: string;
    com_zipcode_en?: string;
    com_telephone?: string;
    com_fax?:string;
    com_website?: string;
    com_email?: string;
    com_factory_pic1?: string;
    com_factory_pic2?: string;
    com_factory_pic3?: string;
    country?: string;
}

export interface BusinessType {
    bus_id?: number;
    bus_name?: string;
}

export interface ProductCategories {
    pro_id?: number;
    pro_name?: string;
}

export interface UploadProduct {
  compi_image_name?: string;
  compi_desc?: string;
  compi_id?: number;
}

export interface PersonContact {
    pre_id?: number;
    comc_firstname?: string;
    comc_lastname?: string;
    comc_middlename?: string;
    comc_position?: string;
    comc_contact_number?: string;
    comc_email?: string;
    comc_picture?: string;
    comc_namecard_front?: string;
    comc_namecard_back?: string;
    title_name?: string;
    comc_id?:number;
}

export interface NoteNeed {
    comn_title?: string;
    comn_note?: string;
}

export interface NoteNeedImage {
    comni_image_name?: string;
}

export interface AdvanceSearch {
    sourcedata?: string;
    office?: string;
    country?: string;
    businesstype?: string;
    company?: string;
    contactperson?: string;
    sorting?: string;
    day_start?: string;
    day_end?: string;
}

