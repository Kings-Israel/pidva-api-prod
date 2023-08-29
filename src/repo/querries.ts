export const PelezaQueries = {
    validateModule: `
    SELECT
      pel_module.module_id,
      pel_module.module_name,
      pel_module.module_code,
      pel_module.module_cost,
      pel_module.module_cost_currency
    FROM pel_module 
    WHERE
     module_code = ? AND status=11
    `,


    validatePackage: `
      SELECT
        pel_package.package_id,
        pel_package.package_name,
        pel_package.package_cost,
        pel_package.package_currency,
        pel_package.dataset_id,
        pel_package.package_data_type,
        pel_package.package_data
      FROM pel_package 
      WHERE
      package_id = ? AND package_status=11
      `,



    SavePelApiRequest: `
    INSERT INTO pel_psmt_request (
      request_ref_number,
      company_name,
      client_number,
      client_name,
      bg_dataset_name,
      user_name,
      client_id,
      file_tracker,
      request_credit_charged,
      package_cost,
      package_id,
      request_package,
      request_plan ,
      request_type,
      registration_number,
      status,
      api_request_type,
      api_request_sub_type ,
      api_client_reference ,
      api_callback_url ,
      api_number_of_records ,
      api_upload_path ,
      api_callback_status ,
      api_system_request ,
      dataset_citizenship ,
      request_date ,
      package_cost_currency,
      api_req_channel ,
      user_id ,
      client_login_id
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    `,

  

    SavePelBgRequestModule: `
    INSERT INTO pel_psmt_request_modules (
      request_id,
      client_id,
      request_ref_number,
      parent_module_id,
      module_cost_quote,
      package_name,
      module_id,
      module_name,
      package_id,
      request_type
      )
      VALUES (?,?,?,?,?,?,?,?,?,?);
    `,

   findPeldata: `
    SELECT
      pel_psmt_request.request_ref_number,
      pel_psmt_request.company_name,
      pel_psmt_request.client_number,
      pel_psmt_request.client_name,
      pel_psmt_request.bg_dataset_name,
      pel_psmt_request.user_name,
      pel_psmt_request.client_id,
      pel_psmt_request.file_tracker,
      pel_psmt_request.request_credit_charged,
      pel_psmt_request.package_cost,
      pel_psmt_request.package_id,
      pel_psmt_request.request_package,
      pel_psmt_request.request_plan ,
      pel_psmt_request.request_type,
      pel_psmt_request.registration_number,
      pel_psmt_request.status,
      pel_psmt_request.api_request_type,
      pel_psmt_request.api_request_sub_type ,
      pel_psmt_request.api_client_reference ,
      pel_psmt_request.api_callback_url ,
      pel_psmt_request.api_number_of_records ,
      pel_psmt_request.api_upload_path ,
      pel_psmt_request.api_callback_status ,
      pel_psmt_request.api_system_request 
    FROM pel_psmt_request 
    WHERE
      request_id = ? 
    `,

    findPeldataByRef: `
    SELECT
      pel_psmt_request.request_ref_number,
      pel_psmt_request.company_name,
      pel_psmt_request.client_number,
      pel_psmt_request.client_name,
      pel_psmt_request.bg_dataset_name,
      pel_psmt_request.user_name,
      pel_psmt_request.client_id,
      pel_psmt_request.file_tracker,
      pel_psmt_request.request_credit_charged,
      pel_psmt_request.package_cost,
      pel_psmt_request.package_id,
      pel_psmt_request.request_package,
      pel_psmt_request.request_plan ,
      pel_psmt_request.request_type,
      pel_psmt_request.registration_number,
      pel_psmt_request.status,
      pel_psmt_request.api_request_type,
      pel_psmt_request.api_request_sub_type ,
      pel_psmt_request.api_client_reference ,
      pel_psmt_request.api_callback_url ,
      pel_psmt_request.api_number_of_records ,
      pel_psmt_request.api_upload_path ,
      pel_psmt_request.api_callback_status ,
      pel_psmt_request.api_system_request 
    FROM pel_psmt_request 
    WHERE
     api_system_request = ? 
    `,

    findPeldataByClientRef: `
    SELECT
      pel_psmt_request.request_ref_number,
      pel_psmt_request.company_name,
      pel_psmt_request.client_number,
      pel_psmt_request.client_name,
      pel_psmt_request.bg_dataset_name,
      pel_psmt_request.user_name,
      pel_psmt_request.client_id,
      pel_psmt_request.file_tracker,
      pel_psmt_request.request_credit_charged,
      pel_psmt_request.package_cost,
      pel_psmt_request.package_id,
      pel_psmt_request.request_package,
      pel_psmt_request.request_plan ,
      pel_psmt_request.request_type,
      pel_psmt_request.registration_number,
      pel_psmt_request.status,
      pel_psmt_request.api_request_type,
      pel_psmt_request.api_request_sub_type ,
      pel_psmt_request.api_client_reference ,
      pel_psmt_request.api_callback_url ,
      pel_psmt_request.api_number_of_records ,
      pel_psmt_request.api_upload_path ,
      pel_psmt_request.api_callback_status ,
      pel_psmt_request.api_system_request 
    FROM pel_psmt_request 
    WHERE
    api_client_reference = ? 
    `,

    UpdateCallBackSuccess: `
        UPDATE pel_psmt_request
        SET api_callback_status = 'SUCCESS'
        WHERE
          request_id = ?
  `,

    UpdateCallBackError: `
    UPDATE pel_psmt_request
    SET api_callback_status = 'ERRORED',
        api_callback_error_type = ? ,
        api_callback_error_details = ? ,
    WHERE
      request_id = ?
  `,

  FetchCompany: `
    SELECT 
      company_logo ,
      company_industry ,
      company_name ,
      company_id,
      company_code
    FROM 
      pel_client_co
    WHERE
      company_code = ?
  `,

  LoginQuerry: `
    SELECT 
        client_id ,
        client_company_id ,
        client_login_username ,
        client_password ,
        status ,
        client_pin ,
        client_first_name ,
        client_last_name ,
        client_mobile_number ,
        client_postal_address ,
        client_postal_code ,
        client_city ,
        client_company_id ,
        client_parent_company
    FROM 
       pel_client
    WHERE
       client_company_id = ? AND  client_login_username=?
  `,
}

