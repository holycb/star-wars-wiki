import { Component } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AppStateService } from '../../../../core/services/app-state.service';
import { Film } from '../../../../core/models/film.model';

@Component({
  selector: 'app-films-list',
  templateUrl: './films-list.component.html',
  styleUrls: ['./films-list.component.css']
})
export class FilmsListComponent {
  films: Film[];
  constructor(
    private dataService: DataService,
    private appStateService: AppStateService
  ) {}
  ngOnInit(): void {
    this.dataService.getFilms().subscribe((films) => {
      this.films = films;
      this.appStateService.unsetLoading();
    });
  }
}
