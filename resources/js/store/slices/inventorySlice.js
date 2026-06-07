import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

// Async thunk to fetch mock data
export const fetchStockDetails = createAsyncThunk(
    'inventory/fetchStockDetails',
    async () => {
        const response = await axios.get('/api/mock-stock');
        return response.data;
    }
);

const initialState = {
    master_barang: null,
    batch_barang: [],
    total_stok: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStockDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchStockDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.master_barang = action.payload.master_barang;
                state.batch_barang = action.payload.batch_barang;
                state.total_stok = action.payload.total_stok;
            })
            .addCase(fetchStockDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default inventorySlice.reducer;
