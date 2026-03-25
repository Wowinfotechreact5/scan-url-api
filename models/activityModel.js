const getApiUsageLogs = (filters, callback) => {

    let query = `
        SELECT
            api_key_name,
            event,
            created_at AS access_on,
            request_url,
            response_data
        FROM tb_api_usage_logs
        ORDER BY id DESC
    `;

    db.query(query, [], callback);
};