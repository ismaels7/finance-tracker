import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateTransactionDTO {

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsNumber()
    amount: number;

    @IsString()
    category: string;

    @IsString()
    @IsNotEmpty()
    date: string;
}