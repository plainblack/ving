import * as pulumi from "@pulumi/pulumi";

export const prefix = (name) => {
    return `${pulumi.getProject()}-${pulumi.getStack()}-${name}`;
}