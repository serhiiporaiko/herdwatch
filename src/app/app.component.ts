import { Component, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  lastTimeBackPress = 0;
  timePeriodToExit = 2500;

  constructor(
    private platform: Platform,
    private router: Router,
    private toast: ToastController) {

    this.platform.backButton.subscribe(() => {
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        if (outlet && outlet.canGoBack()) {
          outlet.pop();

        } else if (this.router.url === '/users') {
          if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
            navigator['app'].exitApp();

          } else {
            const toast = await this.toast.create({
              message: 'Press back again to exit App.',
              duration: 2500,
              position: 'bottom'
            });
            toast.present();
            this.lastTimeBackPress = new Date().getTime();
          }
        }
      });
    });
  }
}
