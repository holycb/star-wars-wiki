import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Character } from '../../core/models/character';
import { Planet } from '../../core/models/planet';
import { AppStateService } from '../../core/services/app-state.service';
import { FilmsService } from '../../core/services/films.service';

/**
 * Component for character page
 */
@Component({
  selector: 'app-character-page',
  templateUrl: './character-page.component.html',
  styleUrls: ['./character-page.component.css'],
})
export class CharacterPageComponent {
  /** Character to render in template */
  public character$: Observable<Character>;

  /** Planet where the character lives on */
  public planet$: Observable<Planet>;
  public constructor(
    private filmsService: FilmsService,
    private route: ActivatedRoute,
    private appStateService: AppStateService,
  ) {
    this.character$ = this.filmsService
      .getCharacterById(+this.route.snapshot.paramMap.get('id'))
      .pipe(
        tap((character) => {
          this.planet$ = this.filmsService
            .getPlanetById(character.homeworldId)
            .pipe(
              tap(() => {
                this.appStateService.stopLoading();
              }),
            );
        }),
      );
  }
}
