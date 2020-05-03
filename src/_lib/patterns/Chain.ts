// Chain of Responsibilty pattern

interface IHandler<T, U> {
    SetNext(handler: IHandler<T, U>): IHandler<T, U>;
    Handle(request: T): U | null;
}

export abstract class AbstractHandler<T, U> implements IHandler<T, U>
{
    private nextHandler: IHandler<T, U>;

    SetNext(handler: IHandler<T, U>): IHandler<T, U> {
        this.nextHandler = handler;
        return handler;
    }

    Handle(request: T): U | null {
        if (this.nextHandler) {
            return this.nextHandler.Handle(request);
        }
        return null;
    }
}

export function Chain<T, U>(...handlers: IHandler<T, U>[]): IHandler<T, U>  {
    for (let i = 0; i < handlers.length - 1; i++) {
        handlers[i].SetNext(handlers[i + 1]);
    }
    return handlers[0];
}