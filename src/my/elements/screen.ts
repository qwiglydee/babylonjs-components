import { css, html, LitElement, nothing, type PropertyValues } from "lit-element";
import { customElement, property } from "lit-element/decorators.js";

import type { ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";

@customElement("b3d-screen")
export class MyScreenElem extends LitElement implements ILoadingScreen {
    @property()
    loadingUIBackgroundColor = "#33334D"; // TODO: put default fill background

    @property()
    loadingUIText: string = "";

    static override styles = css`
        :host {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
            display: grid;
            grid-template-rows: 100%;
            grid-template-columns: 100%;
            justify-items: center;
            align-items: center;
            opacity: 1;
        }

        :host(.hiding) {
            opacity: 0;
            transition: opacity 750ms ease-in;
        }

        :host([hidden]) {
            display: none;
        }

        .label {
            position: absolute;
            left: 0px;
            top: 50%;
            margin-top: 100px;
            width: 100%;
            height: 20px;
            font-family: Arial;
            font-size: 14px;
            color: white;
            text-align: center;
            z-index: 1;
        }

        svg.logo {
            width: 150px;
            grid-area: 1 / 1;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            position: absolute;
        }

        div.spinner {
            width: 300px;
            grid-area: 1 / 1;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            position: absolute;
        }

        svg.spinner {
            animation: 0.75s linear infinite spin1;
            transform-origin: 50% 50% 0px;
        }

        @-webkit-keyframes spin1 {
            0% {
                -webkit-transform: rotate(0deg);
            }
            100% {
                -webkit-transform: rotate(360deg);
            }
        }
        @keyframes spin1 {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    `;

    override render() {
        if (this.hidden) return nothing;
        return html`
            <div class="label">${this.loadingUIText}</div>
            <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180.17 208.04">
                <path fill="#fff" d="M90.09,0,0,52V156l90.09,52,90.08-52V52Z" />
                <polygon fill="#e0684b" points="180.17 52.01 151.97 35.73 124.85 51.39 153.05 67.67 180.17 52.01" />
                <polygon fill="#e0684b" points="27.12 67.67 117.21 15.66 90.08 0 0 52.01 27.12 67.67" />
                <polygon fill="#e0684b" points="61.89 120.3 90.08 136.58 118.28 120.3 90.08 104.02 61.89 120.3" />
                <polygon
                    fill="#bb464b"
                    points="153.05 67.67 153.05 140.37 90.08 176.72 27.12 140.37 27.12 67.67 0 52.01 0 156.03 90.08 208.04 180.17 156.03 180.17 52.01 153.05 67.67"
                />
                <polygon fill="#bb464b" points="90.08 71.46 61.89 87.74 61.89 120.3 90.08 104.02 118.28 120.3 118.28 87.74 90.08 71.46" />
                <polygon fill="#e0ded8" points="153.05 67.67 118.28 87.74 118.28 120.3 90.08 136.58 90.08 176.72 153.05 140.37 153.05 67.67" />
                <polygon fill="#d5d2ca" points="27.12 67.67 61.89 87.74 61.89 120.3 90.08 136.58 90.08 176.72 27.12 140.37 27.12 67.67" />
            </svg>
            <div class="spinner">
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 392 392">
                    <path
                        fill="#e0684b"
                        d="M40.21,126.43c3.7-7.31,7.67-14.44,12-21.32l3.36-5.1,3.52-5c1.23-1.63,2.41-3.29,3.65-4.91s2.53-3.21,3.82-4.79A185.2,185.2,0,0,1,83.4,67.43a208,208,0,0,1,19-15.66c3.35-2.41,6.74-4.78,10.25-7s7.11-4.28,10.75-6.32c7.29-4,14.73-8,22.53-11.49,3.9-1.72,7.88-3.3,12-4.64a104.22,104.22,0,0,1,12.44-3.23,62.44,62.44,0,0,1,12.78-1.39A25.92,25.92,0,0,1,196,21.44a6.55,6.55,0,0,1,2.05,9,6.66,6.66,0,0,1-1.64,1.78l-.41.29a22.07,22.07,0,0,1-5.78,3,30.42,30.42,0,0,1-5.67,1.62,37.82,37.82,0,0,1-5.69.71c-1,0-1.9.18-2.85.26l-2.85.24q-5.72.51-11.48,1.1c-3.84.4-7.71.82-11.58,1.4a112.34,112.34,0,0,0-22.94,5.61c-3.72,1.35-7.34,3-10.94,4.64s-7.14,3.51-10.6,5.51A151.6,151.6,0,0,0,68.56,87C67.23,88.48,66,90,64.64,91.56s-2.51,3.15-3.75,4.73l-3.54,4.9c-1.13,1.66-2.23,3.35-3.33,5a127,127,0,0,0-10.93,21.49,1.58,1.58,0,1,1-3-1.15S40.19,126.47,40.21,126.43Z"
                    />
                </svg>
            </div>
        `;
    }

    protected override update(changes: PropertyValues): void {
        if (changes.has("loadingUIBackgroundColor")) {
            this.style.backgroundColor = this.loadingUIBackgroundColor;
        }
        super.update(changes);
    }

    displayLoadingUI() {
        this.classList.remove("hiding");
        this.hidden = false;
    }

    hideLoadingUI() {
        this.classList.add("hiding");
    }

    override ontransitionend = () => {
        this.hidden = true;
        this.classList.remove("hiding");
    };
}
