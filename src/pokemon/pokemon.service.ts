import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    try {
      const pokemon: Pokemon = await this.pokemonModel.create(createPokemonDto);

      console.log(pokemon);

      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  async createMany(pokemonArray: CreatePokemonDto[]): Promise<Pokemon[]> {
    try {
      const pokemon: Pokemon[] = await this.pokemonModel.insertMany(
        pokemonArray,
      );

      console.log(pokemon);

      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 });
  }

  async findOne(term: string): Promise<Pokemon> {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findOne({ _id: term });
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term });
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon ${term} not found`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemonDB: Pokemon = await this.findOne(term);

      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

      await pokemonDB.updateOne(updatePokemonDto);

      return {
        ...pokemonDB.toJSON(),
        ...updatePokemonDto,
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon ${id} not found`);
    }

    return {
      message: `Pokemon ${id} deleted`,
    };
  }

  async removeAll() {
    const { deletedCount } = await this.pokemonModel.deleteMany({});
    if (deletedCount === 0) {
      throw new NotFoundException(`No Pokemon found`);
    }

    return {
      message: `All Pokemon deleted`,
    };
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Name or no already exist: ${JSON.stringify(error.keyValue)}`,
      );
    }

    console.log(error);

    throw new InternalServerErrorException(
      ` Cannot Update pokemon, error: ${JSON.stringify(error.keyValue)}`,
    );
  }
}
