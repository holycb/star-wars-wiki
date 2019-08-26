import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Film } from '../../models/film';
import { AppConfig } from '../app-config';
import { FilmDTO } from '../dto/film-dto';

/**
 * Used to get data about films and other things
 */
@Injectable({
  providedIn: 'root',
})
export class FilmsService {
  public constructor(private http: HttpClient, private config: AppConfig) {}

  private mapFilm(film: FilmDTO, idx: number): Film {
    return new Film(
      {
        name: film.title,
        director: film.director,
        description: film.opening_crawl,
        episodeId: film.episode_id,
        releaseDate: new Date(film.release_date),
        producedBy: film.producer,
        characters: film.characters,
        starships: film.starships,
        vehicles: film.vehicles,
        species: film.species,
        planets: film.planets,
        imageUrl: film.image_url,
      },
      idx,
    );
  }
  /**
   * Used to get Film[]
   */
  public getFilms(): Observable<Film[]> {
    return this.http
      .get<FilmDTO[]>(this.config.filmsURL + '.json')
      .pipe(map(filmsDto => filmsDto.map(this.mapFilm)));
  }

  /**
   * Returns film by id
   * @param id number of episode
   */
  public getFilmById(id: number): Observable<Film> {
    return this.http
      .get<FilmDTO>(`${this.config.filmsURL}/${id}.json`)
      .pipe(map(result => this.mapFilm(result, id)));
  }

  private formatDate = (date: Date): string =>
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()

  /** Saves film */
  public saveFilm(film: Film): Observable<FilmDTO> {
    return this.http.patch<FilmDTO>(
      `${this.config.filmsURL}/${film.number}/fields.json`,
      {
        characters: film.characters,
        director: film.director,
        episode_id: film.episodeId,
        opening_crawl: film.description,
        planets: film.planets,
        producer: film.producedBy,
        release_date: this.formatDate(film.releaseDate),
        species: film.species,
        starships: film.starships,
        title: film.name,
        vehicles: film.vehicles,
        edited: '',
        created: '',
      } as FilmDTO,
    );
  }
}