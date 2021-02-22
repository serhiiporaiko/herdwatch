import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";

@Injectable({ providedIn: 'root' })
export class LoadingService {

    constructor(
        private loadingCtrl: LoadingController) { }

    async present(message?: string): Promise<HTMLIonLoadingElement> {
        const loading = await this.loadingCtrl.create({ message: message || '' });
        loading.present();
        return loading;
    }

    async dismiss(loading: HTMLIonLoadingElement) {
        return loading.dismiss();
    }
}