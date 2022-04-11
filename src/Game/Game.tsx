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
    // static elementsToRender: HTMLElement[] = [];

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

    }

    componentDidMount() : void {
        if(this.state.isRunning === false ) 
            this.setState({
                isRunning: true
            }, () => this.Run() );

        this.setListeners();
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

        car.AddComponent("RigidBodyComponent", 32,32, 32,32);
        car2.AddComponent("RigidBodyComponent", 32,32, 32,32);

        setInterval(() => {
            this.Render();
            this.Update();
        }, 1000);
    }

    private async Update() : Promise<void> {
        // this.registry.UpdateSystems();
        this.registry.AddEntitiesToSystem();
        // for(let i = 0; i < this.registry.systems.length; i++) {
        //     this.registry.systems[i].Update();
        // }
        const result = this.registry.GetSystem("RenderSystem").Update();

        this.setState({
            elementsToRender: result
        });
    }

    private Render() : void {

    }

    private Destroy (): void {
        this.removeListeners();
    };

    render() {
        return(<div>
            {this.state.elementsToRender.map((x, i) => {
                return <h1 key={i}> hi</h1>;
            })}
        </div>)
    }
}

// var instance = Object.create(this.context[name].prototype);
// instance.constructor.apply(instance, args);
// return instance;