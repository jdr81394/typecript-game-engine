import { Component as ReactComponent } from "react";
import RigidBodyComponent from "../Components/RigidBodyComponent";
import { Entity, Component, System, Registry, ComponentType } from "../ECS/ECS";

interface GameState {
    isRunning: boolean;
    windowHeight: number,
    windowWidth: number,
    elementsToRender: HTMLElement[]
};


export class Game extends ReactComponent {
    registry : Registry = new Registry();
    deltaTime: number = 100;
    canvas: HTMLCanvasElement | null = null; 
    rootElement: HTMLDivElement = document.getElementById("root") as HTMLDivElement;

    state : GameState = {
        isRunning: false,
        windowHeight: 0,
        windowWidth: 0,
        elementsToRender: []
    }


    constructor(props: any = null) {
        super(props);
        this.handleResize = this.handleResize.bind(this);

        this.registry.AddSystem("RenderSystem");
        this.registry.AddSystem("VelocitySystem");
    }

    componentDidMount() : void {
        if(this.state.isRunning === false ) 
            this.setState({
                isRunning: true
            }, () => this.Run() );

        this.setListeners();
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.handleResize();

    }

    componentDidUpdate() {

    }

    private setListeners(): void{
        window.addEventListener("resize", this.handleResize);
    }

    private removeListeners(): void {
        window.removeEventListener("resize", this.handleResize);
    }

    public handleResize(): void {
        const { innerHeight, innerWidth } = window;

        this.setState({
            windowHeight: innerHeight,
            windowWidth: innerWidth
        })
    }

    private Run() : void {

        const car : Entity = this.registry.CreateEntity();
        const car2 : Entity = this.registry.CreateEntity();

        car.AddComponent("RigidBodyComponent", 100,100, 32,32);
        car2.AddComponent("VelocityComponent" , 1, 0);
        car2.AddComponent("RigidBodyComponent", 32,32, 32,32);


        setInterval(() => {
            this.Render();
            this.Update();
        }, 30);
    }

    private async Update() : Promise<void> {

  
        this.registry.GetSystem("VelocitySystem").Update();
    }

    private Render() : void {

        this.registry.GetSystem("RenderSystem").ClearCanvas(this.canvas);

        this.registry.AddEntitiesToSystem();
 
        this.registry.GetSystem("RenderSystem").Update(this.canvas);
    }

    private Destroy (): void {
        this.removeListeners();
    };

    render() {
        return (<canvas  width={this.state.windowWidth} height={this.state.windowHeight} id="canvas"></canvas>)
    }
}

// var instance = Object.create(this.context[name].prototype);
// instance.constructor.apply(instance, args);
// return instance;