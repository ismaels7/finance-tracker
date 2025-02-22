import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
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
        this.tableName = this.configService.get("DYNAMODB_USERS_TABLE") as string;
    }

    async createUser(email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: uuidv4(),
            email,
            password: hashedPassword,
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: user
        })

        await this.docClient.send(command);
        return user;

    }

    async findUserByEmail (email: string) {
        console.log('Finding user by email in user.service')
        const params = {
            TableName: this.tableName,
            Key: { email }
        };

        const command = new GetCommand(params);
        const response = await this.docClient.send(command)

        if (response.Item) {
            console.log('User found')
        } else {
            console.log('User not found')
        }

        return response.Item || null;
    }

    async getAllUsers() {
        const params = {
            TableName: this.tableName,
        };
        const command = new ScanCommand(params);
        const response = await this.docClient.send(command);
    
        return  response.Items
        
    }

}
