const axios = require("axios")

// https://sms.igama.ir/api/v1/send/pattern
// gymsoft
// @@Gymsoft2022@@
// otp


// const gamaConfigSms: GamaPatternDTO = {
//     username: config?.username,
//     password: config?.password,
//     destination: data.mobile,
//     expire: 120,
//     pattern: data.templateName,
//     tokens: this._convertToken(data.tokens || {})
//   };

// tokens: { otp: params.token, name: params.name }

const tokens = [
    {
        name: 'name',
        value: 'test varzeshsoft'
    },
    {
        name: 'otp',
        value: '123456'
    }
]


const gamaConfigSms = {
    username: 'gymsoft',
    password: '@@Gymsoft2022@@',
    destination: '09925087579',
    expire: 120,
    pattern: 'gymsoft_otp',
    tokens
};


axios.post('https://sms.igama.ir/api/v1/send/pattern', gamaConfigSms).then((data) => {
    console.log("success : ", data)
}).catch((error) => {
    console.log("failed ...", error)
})