import { Component } from "../ECS/ECS";

class RigidBodyComponent extends Component {
    x: number;
    y: number;
    constructor(...args: number[]){

        super();
        this.x = args[0]
        this.y = args[1];
    };
}


// interface RigidBodyComponent {
//     x: number;
//     y: number;
// }


export default RigidBodyComponent;

