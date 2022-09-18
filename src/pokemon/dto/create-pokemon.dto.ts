import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from "class-validator";

export class CreatePokemonDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    no: number;
}
