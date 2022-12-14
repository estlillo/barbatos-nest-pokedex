import { Injectable } from '@nestjs/common';
import { HttpAdapter } from 'src/common/adapters/http.adapter';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: HttpAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=1000000',
    );

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      this.pokemonService.create({ name, no });
    });

    return data.results;
  }

  async executeSeedSimultaneo() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=1000000',
    );

    const pokemonToInsert: CreatePokemonDto[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });

    const pokemonInserted = await this.pokemonService.createMany(
      pokemonToInsert,
    );

    return pokemonInserted;
  }
}
