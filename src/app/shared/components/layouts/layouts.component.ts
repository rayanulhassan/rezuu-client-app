import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EmptyLayoutComponent } from "./empty-layout/empty-layout.component";
import { DefaultLayoutComponent } from "./default-layout/default-layout.component";


@Component({
  selector: 'app-layouts',
  imports: [EmptyLayoutComponent, DefaultLayoutComponent],
  templateUrl: './layouts.component.html',
  styles: ``
})
export class LayoutsComponent {
  #route = inject(ActivatedRoute);  
  layout = toSignal(this.#route.data.pipe(map((data) => data['layout'])),{initialValue: 'default'});
}
