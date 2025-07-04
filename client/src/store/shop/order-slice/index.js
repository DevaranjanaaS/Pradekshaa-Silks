import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://pradekshaa-silks-backend.onrender.com";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/shop/order/create`,
      orderData
    );

    return response.data;
  }
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/shop/order/capture`,
      {
        paymentId,
        payerId,
        orderId,
      }
    );

    return response.data;
  }
);

export const captureRazorpayPayment = createAsyncThunk(
  "/order/captureRazorpayPayment",
  async ({ razorpay_payment_id, orderId }) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/shop/order/capture`,
      {
        paymentId: razorpay_payment_id,
        payerId: "",
        orderId,
      }
    );

    return response.data;
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "/order/verifyRazorpayPayment",
  async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId }) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/shop/order/verify-razorpay`,
      {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        orderId,
      }
    );
    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/shop/order/list/${userId}`
    );

    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/shop/order/details/${id}`
    );

    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state) => {
        state.isLoading = false;
        // Optionally, set a flag or message for payment verification success
      })
      .addCase(verifyRazorpayPayment.rejected, (state) => {
        state.isLoading = false;
        // Optionally, set a flag or message for payment verification failure
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
