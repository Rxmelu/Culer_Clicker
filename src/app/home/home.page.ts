import { Component, OnInit, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonContent, ToastController, IonGrid, IonRow, IonCol, ModalController, IonIcon } from '@ionic/angular';
import { ShopComponent } from './shop/shop.component';
import { addIcons } from 'ionicons';
import { trendingUp } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    DecimalPipe,
    IonContent,
    IonGrid, 
    IonRow, 
    IonCol,
    IonIcon
  ],
})
export class HomePage implements OnInit {

  contador: number = 0; 
  extra_clicks: number = 0; 
  nivelMasia: number = 0;
  nivelCampNou: number = 0;
  nivelLionel: number = 0;
  madridDestruido: boolean = false;
  animandoDestruccion: boolean = false;
  tiempoPalanca: number = 0;
  private palancaInterval: any = null;
  floatingTexts: { id: number; value: string; top: number; left: number }[] = [];
  private nextId = 0;

  constructor(
    private toastController: ToastController, 
    private modalController: ModalController,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ trendingUp });
  }

  ngOnInit() {
    this.cargarDatosLocales();
    this.iniciarGeneracionAutomatica();
  }

  cargarDatosLocales() {
    this.contador = Number(localStorage.getItem('clicks')) || 0;
    this.extra_clicks = Number(localStorage.getItem('extra_clicks')) || 0;
    this.nivelMasia = Number(localStorage.getItem('nivelMasia')) || 0;
    this.nivelCampNou = Number(localStorage.getItem('nivelCampNou')) || 0;
    this.nivelLionel = Number(localStorage.getItem('nivelLionel')) || 0;
    this.madridDestruido = localStorage.getItem('madridDestruido') === 'true';
  }

  iniciarGeneracionAutomatica() {
    setInterval(() => {
      if (this.nivelMasia > 0) {
        const clicksPorSegundo = this.nivelMasia * 15;
        
        this.ngZone.run(() => {
          this.contador += clicksPorSegundo;
          this.updateLocalStorageClicks();
          this.cdr.detectChanges();
        });
      }
    }, 1000);
  }

  activarPalancaFinanciera() {
    this.tiempoPalanca = 60;
    if (this.palancaInterval) clearInterval(this.palancaInterval);

    this.palancaInterval = setInterval(() => {
      this.ngZone.run(() => {
        if (this.tiempoPalanca > 0) {
          this.tiempoPalanca--;
        } else {
          clearInterval(this.palancaInterval);
        }
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  getMasiaImagen(): string {
    switch (this.nivelMasia) {
      case 1: return 'assets/img/masiaT1.png';
      case 2: return 'assets/img/masiaT2.png';
      case 3: return 'assets/img/masiaT3.png';
      default: return '';
    }
  }

  getCampNouImagen(): string {
    switch (this.nivelCampNou) {
      case 1: return 'assets/img/campnouT1.png';
      case 2: return 'assets/img/campnouT2.png';
      case 3: return 'assets/img/campnouT3.png';
      default: return '';
    }
  }

  async openShop() {
    const modal = await this.modalController.create({
      component: ShopComponent,
      cssClass: 'fcb-shop-modal',
      componentProps: {
        nivelMasia: this.nivelMasia,
        nivelCampNou: this.nivelCampNou,
        nivelLionel: this.nivelLionel
      }
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === "buy" && data) {
      if (this.contador >= data.price) {
        this.restarClicks(data.price);

        if (data.tipo === 'destruir_madrid') {
          this.madridDestruido = true;
          localStorage.setItem('madridDestruido', 'true');
          this.dispararAnimacionDestruccion();
        }

        if (data.tipo === 'palanca') {
          this.activarPalancaFinanciera();
        }

        if (data.name.includes("Consejos de Lionel")) {
          this.nivelLionel++;
          this.extra_clicks = this.nivelLionel; 
          localStorage.setItem("nivelLionel", String(this.nivelLionel));
          localStorage.setItem("extra_clicks", String(this.extra_clicks));
        }

        if (data.name.includes("La Masía")) {
          this.nivelMasia++;
          localStorage.setItem("nivelMasia", String(this.nivelMasia));
        }
        
        if (data.name.includes("Camp Nou")) {
          this.nivelCampNou++;
          localStorage.setItem("nivelCampNou", String(this.nivelCampNou));
        }

        this.cdr.detectChanges();
      }
    }
  }

  dispararAnimacionDestruccion() {
    this.animandoDestruccion = true;
    setTimeout(() => {
      this.animandoDestruccion = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  ContadorClicks(event: MouseEvent) {
    let gananciaBase = 1 + this.extra_clicks;
    let gananciaTotal = this.tiempoPalanca > 0 ? gananciaBase * 2 : gananciaBase;
    
    this.ngZone.run(() => {
      this.contador += gananciaTotal;
      this.updateLocalStorageClicks();
      
      this.crearTextoFlotante(event, `+${gananciaTotal}`);
      this.cdr.detectChanges();
    });
  }

  crearTextoFlotante(event: MouseEvent, text: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const id = this.nextId++;
    this.floatingTexts.push({ id, value: text, top: y, left: x });

    setTimeout(() => {
      this.floatingTexts = this.floatingTexts.filter(t => t.id !== id);
      this.cdr.detectChanges();
    }, 800);
  }

  restarClicks(num: number) {
    this.contador -= num;
    this.updateLocalStorageClicks();
  }

  updateLocalStorageClicks() {
    localStorage.setItem('clicks', String(this.contador));
  }
}