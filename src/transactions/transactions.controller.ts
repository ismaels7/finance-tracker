import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from 'src/entities/transaction.entity';
import { AuthenticatedRequest } from 'src/auth/types/types';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionService: TransactionsService) { }

    @Post()
    async createTransaction(
        @Req() request: AuthenticatedRequest,
        @Body() transaction: Omit<Transaction, 'userId' | 'id' | 'createdAt' | 'updatedAt'>) {
        const userId = request.user!.id;
        return this.transactionService.createTransaction(userId, transaction)
    }

    @Get()
    async getTransactionsByUserId(
        @Req() request: AuthenticatedRequest
    ) {
        const userId = request.user!.id
        console.log('userID for transactionsByUserID ', userId)
        return this.transactionService.getTransactionsByUserId(userId)
    }

    @Get(':id')
    async getTransactionIdByUserId(
        @Req() request: AuthenticatedRequest,
        @Param('id') transactionId: string,
    ) {
        const userId = request.user!.id
        return this.transactionService.getTransactionIdByUserId(userId, transactionId)
    }

    @Put(':id')
    async updateTransaction(
        @Req() request: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() updatedData: Partial<Transaction>) {
        const userId = request.user!.id
        return this.transactionService.updateTransaction(userId, id, updatedData)
    }

    @Delete(':id')
    async deleteTransaction(
        @Req() request: AuthenticatedRequest,
        @Param('id') id: string) {
        console.log('delete transaction - Controller')
        const userId = request.user!.id
        return this.transactionService.deleteTransaction(userId, id)
    }

    @Get('/filter')
    async filterTransactionsByCategory(
        @Query('userId') userId: string,
        @Query('category') category: string) {
        return this.transactionService.filterTransactionsByCategory(userId, category)
    }
}
