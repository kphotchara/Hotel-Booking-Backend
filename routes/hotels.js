const express = require('express');
const router = express.Router();
const bookingRouter=require('./booking');


const {protect,authorize} = require('../middleware/auth');

router.use('/:hotelId/booking/',bookingRouter);

const {getHotel , getHotels , createHotel , updateHotel , deleteHotel} = require('../controllers/hotels');

router.route('/').get(getHotels).post(protect,authorize('admin'),createHotel);
router.route('/:id').get(getHotel).put(protect,authorize('admin'),updateHotel).delete(protect,authorize('admin','manager'),deleteHotel);


module.exports=router;
