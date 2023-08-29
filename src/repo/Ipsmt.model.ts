export interface Ipsmt {
    request_ref_number:string,
    bg_dataset_name:string,
    request_id:number,
    request_plan:string,
}

export interface Ipackage {
    package_name:string,
    package_cost:string,
    package_id:number,
    dataset_id:number,
    package_currency:string,
    package_data_type:string,
    package_data:string,
}


export interface Imodule {
    module_id:number,
    module_name:string,
    module_code:string,
    module_cost:string,
    module_cost_currency:string,
}

export interface IPelReq {
    request_ref_number:string,
    company_name:string,
    client_number:string,
    bg_dataset_name:string,
    client_name:string,
    user_name:string,
    client_id:number,
    client_login_id:number,
    file_tracker:string,
    request_credit_charged:string,
    package_cost:string,
    package_id:number
    request_package:number,
    request_plan :string,
    request_type:string,
    registration_number:string,
    status:string,
    dataset_citizenship:string,
    api_request_type:string,
    api_request_sub_type :string,
    api_client_reference :string,
    api_callback_url :string,
    api_number_of_records :number,
    api_upload_path :string,
    api_callback_status:string,
    api_system_request:string,
    request_date:string ,
    package_cost_currency :string,
    api_req_channel:string,
    user_id:number
    
}


export interface IPelModule {
    request_id:string,
    client_id:number
    request_ref_number:string,
    parent_module_id:number,
    module_cost_quote:string,
    package_name:string,
    module_id:number,
    module_name:string,
    package_id:number,
    request_type:string,

}


export interface IPelData {
    request_ref_number:string,
    company_name:string,
    client_number:string,
    bg_dataset_name:string,
    api_request_type:string,
    api_request_sub_type :string,
    api_client_reference :string,
    api_callback_url :string,
    api_number_of_records :number,
    api_upload_path :string,
    api_callback_status:string,
    api_system_request:string,
}

export interface IClientData {
    client_id:number ,
    client_login_username:string ,
    client_password :string,
    status:number ,
    company :string,
    client_pin :string,
    client_first_name :string,
    client_last_name :string,
    client_mobile_number :string,
    client_postal_address:string ,
    client_postal_code:string ,
    client_city:string ,
    client_company_id:string ,
    client_parent_company:string,
    client_counter:number
}
export interface ICompanyData {
    company_logo:string,
    company_industry:string ,
    company_name:string ,
    company_id:number ,
    company_code:string ,
}