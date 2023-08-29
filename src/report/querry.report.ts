export const PelezaReportQueries = {

    NgoReportQuerry: `
     SELECT 
        pel_company_registration.company_name, 
        pel_company_registration.email_address, 
        pel_company_registration.registration_number, 
        pel_company_registration.mobile_number, 
        pel_company_registration.registration_date, 
        pel_company_registration.country, 
        pel_company_registration.data_notes, 
        pel_company_registration.match_status, 
        pel_company_registration.address, 
        pel_company_registration.offices, 
        pel_company_registration.operation_status, 
        pel_company_registration.industry, 
        pel_company_registration.module_name, 
        pel_company_registration.business_type, 
        pel_company_registration.nature_of_business, 
        pel_company_registration.postal_address, 
        pel_company_registration.type, 
        pel_company_registration.member_count, 
        pel_company_registration.objective, 
        pel_company_official_details.role, 
        pel_company_official_details.name AS official_name, 
        pel_psmt_request.request_ref_number, 
        pel_psmt_request.request_id, 
        pel_psmt_request.request_plan, 
        pel_psmt_request.status, 
        pel_psmt_request.request_package, 
        pel_psmt_request.registration_number AS request_reg_number, 
        pel_psmt_request.client_number, 
        pel_psmt_request.request_date, 
        pel_psmt_request_modules.request_id, 
        pel_psmt_request_modules.module_id, 
        pel_psmt_request.request_ref_number, 
        pel_module.module_code 
    FROM 
        pel_company_registration 
        INNER JOIN pel_company_official_details ON pel_company_official_details.company_id = pel_company_registration.company_reg_id 
        INNER JOIN pel_psmt_request ON pel_company_registration.search_id = pel_psmt_request.request_ref_number 
        INNER JOIN pel_psmt_request_modules ON pel_psmt_request_modules.request_id = pel_psmt_request.request_ref_number 
        INNER JOIN pel_module ON pel_psmt_request_modules.module_id = pel_module.module_id 
    WHERE 
        pel_psmt_request.request_id =?
    `,

    BussinessReportQuerry: `
      SELECT 
        pel_company_registration.company_name, 
        pel_company_registration.email_address, 
        pel_company_registration.registration_number, 
        pel_company_registration.mobile_number, 
        pel_company_registration.registration_date, 
        pel_company_registration.country, 
        pel_company_registration.data_notes, 
        pel_company_registration.match_status, 
        pel_company_registration.address, 
        pel_company_registration.offices, 
        pel_company_registration.operation_status, 
        pel_company_registration.industry, 
        pel_company_registration.module_name, 
        pel_company_registration.business_type, 
        pel_company_registration.nature_of_business, 
        pel_company_registration.postal_address, 
        pel_company_registration.type, 
        pel_company_registration.member_count, 
        pel_company_registration.objective, 
        pel_psmt_request.request_ref_number, 
        pel_psmt_request.request_id, 
        pel_psmt_request.request_plan, 
        pel_psmt_request.status, 
        pel_psmt_request.request_package, 
        pel_psmt_request.registration_number AS request_reg_number, 
        pel_psmt_request.client_number, 
        pel_psmt_request.request_date, 
        pel_psmt_request_modules.request_id, 
        pel_psmt_request_modules.module_id, 
        pel_module.module_code, 
        pel_company_shares_data.shares_id, 
        pel_company_shares_data.first_name, 
        pel_company_shares_data.second_name, 
        pel_company_shares_data.status, 
        pel_company_shares_data.share_type, 
        pel_company_shares_data.address, 
        pel_company_shares_data.added_by, 
        pel_company_shares_data.verified_by, 
        pel_company_shares_data.user_id, 
        pel_company_shares_data.search_id, 
        pel_company_shares_data.registration_date, 
        pel_company_shares_data.shafile, 
        pel_company_shares_data.data_source, 
        pel_company_shares_data.data_notes, 
        pel_company_shares_data.match_status, 
        pel_company_shares_data.third_name, 
        pel_company_shares_data.shares_number, 
        pel_company_shares_data.data_id, 
        pel_company_shares_data.date_added, 
        pel_company_shares_data.verified_date, 
        pel_company_shares_data.review_status, 
        pel_company_shares_data.review_notes, 
        pel_company_shares_data.percentage, 
        pel_company_shares_data.id_number, 
        pel_company_shares_data.business, 
        pel_company_shares_data.description, 
        pel_company_shares_data.citizenship 
     FROM 
        pel_company_registration 
        INNER JOIN pel_psmt_request ON pel_company_registration.search_id = pel_psmt_request.request_ref_number 
        INNER JOIN pel_psmt_request_modules ON pel_psmt_request_modules.request_id = pel_psmt_request.request_ref_number 
        INNER JOIN pel_module ON pel_psmt_request_modules.module_id = pel_module.module_id 
        INNER JOIN pel_company_shares_data ON pel_company_shares_data.business = pel_company_registration.company_reg_id 
     WHERE 
        pel_psmt_request.request_id =?
    `,


    //  if mcode == 'CO' or mcode == 'ICO':
    BussinessNominalShare:`
      SELECT 
        pel_company_registration.search_id, 
        pel_psmt_request.request_id, 
        pel_company_share_capital.id, 
        pel_company_share_capital.number_of_shares, 
        pel_company_share_capital.nominal_value, 
        pel_company_share_capital.name, 
        pel_company_share_capital.business_id 
      FROM 
        pel_company_registration 
        INNER JOIN pel_psmt_request ON pel_psmt_request.request_ref_number = pel_company_registration.search_id 
        INNER JOIN pel_company_share_capital ON pel_company_share_capital.business_id = pel_company_registration.company_reg_id 
       WHERE 
        pel_psmt_request.request_id =?
    `,
     //  if mcode == 'CO' or mcode == 'ICO':
    BussinessEncumburance:`
     SELECT 
        pel_company_encumbrances.id, 
        pel_company_encumbrances.search_id, 
        pel_company_encumbrances.status, 
        pel_company_encumbrances.description, 
        pel_company_encumbrances.date, 
        pel_company_encumbrances.amount_secured, 
        pel_company_encumbrances.added_by, 
        pel_company_encumbrances.date_added, 
        pel_company_encumbrances.last_updated, 
        pel_company_encumbrances.review_status, 
        pel_company_encumbrances.verified_by, 
        pel_company_encumbrances.review_notes, 
        pel_company_encumbrances.verified_date, 
        pel_company_encumbrances.business, 
        pel_company_registration.search_id, 
        pel_psmt_request.request_id 
    FROM 
        pel_company_encumbrances 
        INNER JOIN pel_company_registration ON pel_company_registration.company_reg_id = pel_company_encumbrances.business 
        INNER JOIN pel_psmt_request ON pel_psmt_request.request_ref_number = pel_company_registration.search_id 
        WHERE pel_psmt_request.request_id =?
            `,


   // all querries use this 
    DefaultReportQuerry: `
    SELECT 
        pel_psmt_request.request_ref_number,
        pel_psmt_request.bg_dataset_name, 
        pel_psmt_request.request_id, 
        pel_psmt_request.request_plan, 
        pel_psmt_request.dataset_citizenship, 
        pel_psmt_request.bg_dataset_email, 
        pel_psmt_request.bg_dataset_mobile, 
        pel_psmt_request.bg_dataset_idnumber, 
        pel_psmt_request.registration_number, 
        pel_psmt_request.client_number, 
        pel_psmt_request.company_type, 
        pel_psmt_request.dataset_incorporation_no, 
        pel_psmt_request.dataset_kra_pin, 
        pel_psmt_request.request_type, 
        pel_psmt_request.dataset_name, 
        pel_psmt_request.request_package, 
        pel_module.module_code, 
        pel_psmt_request.client_id, 
        pel_psmt_request.client_login_id, 
        pel_psmt_request.client_name, 
        pel_psmt_request.request_date, 
        pel_psmt_request.package_id, 
        pel_psmt_request.verified_date, 
        pel_psmt_request.adverse_status, 
        pel_psmt_request.company_name ,
        pel_psmt_request.api_request_type,
        pel_psmt_request.api_request_sub_type ,
        pel_psmt_request.api_client_reference ,
        pel_psmt_request.api_callback_url ,
        pel_psmt_request.api_number_of_records ,
        pel_psmt_request.api_upload_path ,
        pel_psmt_request.api_callback_status ,
        pel_psmt_request.api_system_request , 
        pel_psmt_request.api_req_channel,
        pel_psmt_request.api_callback_error_details,
        pel_psmt_request.api_callback_error_type,
        pel_psmt_request.status,
        pel_psmt_request.comments
     FROM 
        pel_psmt_request 
        INNER JOIN pel_psmt_request_modules ON pel_psmt_request_modules.request_ref_number = pel_psmt_request.request_ref_number 
        INNER JOIN pel_module ON pel_psmt_request_modules.module_id = pel_module.module_id 
    WHERE 
        pel_psmt_request.request_id =?
    `,

}