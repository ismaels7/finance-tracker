import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from "uuid";
import { Transaction } from 'src/entities/transaction.entity';



@Injectable()
export class TransactionsService {
    private docClient: DynamoDBDocumentClient;
    private tableName: string;

    constructor(private configService: ConfigService) {
        const client = new DynamoDBClient({
            region: this.configService.get("AWS_REGION"),
            credentials: {
                accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID") as string,
                secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY") as string,
            },
        });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.tableName = this.configService.get("DYNAMODB_TRANSACTIONS_TABLE") as string;
    }

    // Add a new transaction
    async createTransaction(userId: string, transaction: Omit<Transaction, 'userId' | 'id' | 'createdAt' | 'updatedAt'>) {
        const newTransaction = {
            id: uuidv4(),
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...transaction,
        }
        const command = new PutCommand({
            TableName: this.tableName,
            Item: newTransaction,
        });
        await this.docClient.send(command);
        return { message: 'Transaction added successfully', transaction: newTransaction };
    }

    async getTransactionsByUserId(userId: string) {
        // Log the category to check its value
        console.log('Received userID:', userId);
        // Check if category is valid
        if (!userId || userId.trim() === '') {
            throw new Error('UserID parameter is required and cannot be empty');
        }

        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId, // Directly pass the category value
            },
        });


        try {
            const response = await this.docClient.send(command);
            console.log('DynamoDB response for filtering:', response);  // Added logging
            return response.Items || { message: 'No transactions found for the given userId' };
        } catch (error) {
            console.error('Error in DynamoDB scan:', error);
            throw new Error('Error fetching transactions by userId');
        }
    }

    async getTransactionIdByUserId(userId: string, transactionId: string){
        if (!userId || !transactionId) {
            throw new Error('Both UserID and TransactionID are required and cannot be empty');
        }

        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                userId: userId
            },
        });

        try{
            const response = await this.docClient.send(command)
            if (response.Item){ 
                return response.Item
            } else {
                return { message: `Error while getting transaction with ID: ${transactionId} for this UserID: ${userId}`}
            }
        } catch (error) {
            console.error('Error getting transaction', error)
            throw new Error('Error fetching transaction')
        }
    }


    async getAllTransactions(limit?: number, lastEvaluatedKey?: string | null) {
        const params = {
            TableName: this.tableName,
            Limit: limit || 10,
            ExclusiveStartKey: lastEvaluatedKey ? { id: lastEvaluatedKey } : undefined
        }
        const command = new ScanCommand(params);
        const response = await this.docClient.send(command);
        console.log('All transactions response:', response); // Added logging
        return {
            Items: response.Items,
            lastEvaluatedKey: response.LastEvaluatedKey ? response.LastEvaluatedKey.id : null
        }
    }

    async updateTransaction(userId: string, id: string, updatedData: Partial<Transaction>) {
        if (!id || !userId) {
            throw new Error('Both UserID and TransactionID are required');
        }
        const updateExpressionParts: string[] = [];
        const expressionAttributeValues: any = {};
        const expressionAttributeNames: any = {};  // This will hold the placeholder for reserved keywords

        updatedData.updatedAt = new Date().toISOString();

        // Iterate over the updated data and build update expressions
        Object.keys(updatedData).forEach((key) => {
            // If key is a reserved keyword, map it to a placeholder
            // Here we map "type" to "#type", you can add more mappings here as needed
            let mappedKey = key;
            if (key === 'type') {
                mappedKey = '#type';  // The hash sign replaces the reserved keyword
                expressionAttributeNames[mappedKey] = key;  // Actual attribute name mapping
            }

            updateExpressionParts.push(`${mappedKey} = :${key}`);
            expressionAttributeValues[`:${key}`] = updatedData[key];
        });
        const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { userId, id }, // Ensure the correct key is passed
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames, // Correct usage of ExpressionAttributeNames
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW', // This ensures we return the updated item
        });

        try {
            const response = await this.docClient.send(command);
            return { message: 'Transaction successfully updated', transaction: response.Attributes };
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw new Error('Error updating transaction');
        }
    }

    async deleteTransaction(userId: string, id: string) {
        if (!id || !userId) {
            throw new Error('Both UserID and TransactionID are required');
        }

        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: { userId, id },
            ReturnValues: 'ALL_OLD',
        });

        try {
            const response = await this.docClient.send(command);
            return { message: 'Transaction successfully deleted', transaction: response.Attributes };
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw new Error('Error deleting transaction');
        }
    }

    // Filter transactions based on category
    async filterTransactionsByCategory(userId: string, category: string) {
        // Log the category to check its value
        console.log('Received category:', category);
        // Check if category is valid
        if (!userId || !category || category.trim() === '') {
            throw new Error('Both UserID and Category parameters are required and cannot be empty');
        }

        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'category = :category',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':category': category, // Directly pass the category value
            },
        })


        try {
            const response = await this.docClient.send(command);
            console.log('DynamoDB response for filtering:', response);  // Added logging

            // Check if Items is present
            if (response.Items) {
                console.log('Items found:', response.Items);  // Added logging
                if (response.Items.length > 0) {
                    return response.Items;
                } else {
                    return { message: 'No transactions found for the given category' };
                }
            } else {
                console.log('No items returned by DynamoDB');
                return { message: 'No transactions found for the given category' };
            }
        } catch (error) {
            console.error('Error in DynamoDB scan:', error);
            throw new Error('Error fetching transactions');
        }
    }


    
}