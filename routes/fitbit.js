const express = require('express');
const axios = require('axios');
const router = express.Router();

// Lấy thông tin từ .env
const CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.FITBIT_REDIRECT_URI;

let accessToken = '';  // Lưu trữ Access Token

// Route chính hiển thị trang chủ
router.get('/', (req, res) => {
    res.render('index', { stepsData: null });
});

// Route để yêu cầu xác thực với Fitbit (OAuth2.0)
router.get('/authorize', (req, res) => {
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=activity%20heartrate%20sleep&expires_in=604800`;
    res.redirect(authUrl);
});

// Route callback để xử lý sau khi người dùng cấp quyền


router.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    try {
        // Gửi yêu cầu POST để đổi mã Authorization Code lấy Access Token
        const response = await axios.post('https://api.fitbit.com/oauth2/token', null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            },
            params: {
                client_id: CLIENT_ID,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code: authorizationCode,
            },
        });

        console.log(authorizationCode);

        // Lưu Access Token
        const accessToken = response.data.access_token;
        
        // Chuyển hướng đến trang dashboard với Access Token
        res.redirect(`/dashboard?token=${accessToken}`);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Có lỗi xảy ra trong quá trình trao đổi mã');
    }
});


// Route lấy dữ liệu từ Fitbit API và hiển thị biểu đồ
router.get('/dashboard', async (req, res) => {
    if (!accessToken) {
        return res.redirect('/authorize');
    }

    try {
        const response = await axios.get('https://api.fitbit.com/1/user/-/activities/steps/date/today/30d.json', {
            headers: { 'Authorization': 'Bearer' +accessToken },
        });

        const stepsData = response.data['activities-steps'].map(day => day.value);
        res.render('index', { stepsData });
    } catch (error) {
        console.error('Lỗi lấy dữ liệu Fitbit:', error);
        res.send('Có lỗi xảy ra trong quá trình lấy dữ liệu.');
    }
});

module.exports = router;
