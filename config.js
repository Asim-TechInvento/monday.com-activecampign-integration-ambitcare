const config = {
    activeCampaign: {
        url:"",
        token:"",
        contact: {
            fields: [
                {
                    id: "",
                    name: ""
                }
            ]
        }
    },
    monday: {
        accessToken:"",
        boards: {
            patient: {
                fieldsToExtract: ["Phone", "Email", "Patient name", "Caregiver name", "GSA ID", "State", "MR Link","GC Link Text","AI Link Text","Medical Release Form",]
            }
        }
    }
};

module.exports = config;