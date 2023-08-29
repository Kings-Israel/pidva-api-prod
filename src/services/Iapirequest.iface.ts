export interface IRequestData {
    request_type:string,
    request_sub_type:string,
    client_reference:string,
    system_reference?:string,
    channel:string,
    callback_url:string,
    number_of_records?:number,
    validation_status?:string,
    upload_path:string,
    callback_status?:string ,
    request_date?:string,
    validation_data:any ,
    company_name:string,
    client_number:string,
    client_id:string,
    user_name:string,
    user_id:number;
    client_login_id:string;
  }


  export interface ILoginRequestData {
    client_company_id:string,
    client_login_username :string,
    client_password:string ,

  }