import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocationDTO } from '../../models/types';

/** Sedes/concesionarios. GET público · escritura requiere ADMIN. */
@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly base = `${environment.apiUrl}/locations`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<LocationDTO[]> {
    return this.http.get<LocationDTO[]>(this.base);
  }

  getById(id: number): Observable<LocationDTO> {
    return this.http.get<LocationDTO>(`${this.base}/${id}`);
  }

  create(dto: LocationDTO): Observable<LocationDTO> {
    return this.http.post<LocationDTO>(this.base, dto);
  }

  update(id: number, dto: LocationDTO): Observable<LocationDTO> {
    return this.http.put<LocationDTO>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
