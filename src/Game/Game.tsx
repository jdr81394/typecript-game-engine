import { Component as ReactComponent } from "react";
import { TupleType } from "typescript";
import RigidBodyComponent from "../Components/RigidBodyComponent";
import { Entity, Component, System, Registry, ComponentType } from "../ECS/ECS";

interface GameState {
    isRunning: boolean;
    windowHeight: number,
    windowWidth: number,
};


export class Game extends ReactComponent {
    registry : Registry = new Registry();
    deltaTime: number = 33;
    canvas: HTMLCanvasElement | null = null; 
    rootElement: HTMLDivElement = document.getElementById("root") as HTMLDivElement;

    state : GameState = {
        isRunning: false,
        windowHeight: 0,
        windowWidth: 0,
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

        const megaman : Entity = this.registry.CreateEntity();

        // key is the x axis, value is the y axis;
        const megamanStandingAnimation: Array<number> = [0,0,1,0];      // A Set of tuples would work best but Typescript doesn't have a true tuple data structure
        const megamanRunningAnimation: Array<number> = [0,2,0,3,0,4,0,5];
        megaman.AddComponent("VelocityComponent" , 1, 0);
        megaman.AddComponent("SpriteComponent", "'megaman-all'",60,32, JSON.stringify(megamanStandingAnimation),JSON.stringify(megamanRunningAnimation));
        megaman.AddComponent("RigidBodyComponent", 32,32, 52,82);

        // eval(`new SpriteComponent("reactLogo")`);

        setInterval(() => {
            this.Render();
            this.Update();
        }, this.deltaTime);
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
        return (
        <canvas  width={this.state.windowWidth} height={this.state.windowHeight} id="canvas"></canvas>
        )
    }
}

// var instance = Object.create(this.context[name].prototype);
// instance.constructor.apply(instance, args);
// return instance;