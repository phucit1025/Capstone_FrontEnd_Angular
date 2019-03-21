import {Component} from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent {
  constructor(private router: Router, private activedRoute: ActivatedRoute, private title: Title) {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    ).subscribe((event) => {
      if (Object.keys(event)) {
        this.title.setTitle(event['title']);
      } else {
        this.title.setTitle('EBSMS');
      }
    });
  }

}
