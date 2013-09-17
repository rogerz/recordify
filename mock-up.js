function Foo() {
    this.bar = 1;
}

Foo.prototype.reset = function () {
    this.bar = 0;
    console.log('bar='+this.bar);
}

Foo.prototype.count = function () {
    this.bar = this.bar + 1;
    console.log('bar='+this.bar);
}

function Step(obj, fn, args) {
    this.obj = obj;
    this.fn = fn;
    this.args = args;
}

function Recorder(config) {
    this.obj = config.obj
    this.oldFns = {};
    this.steps = [];

    for (var i = 0; i < config.fns.length; i++) {
	    var fn = config.fns[i]
	    this.oldFns[fn] = this.obj[fn];
    }
    
}

Recorder.prototype.start = function () {
    console.log('record start');
    var fn, rec = this;

    for (fn in this.oldFns) {
	    recordable(this.obj, fn);
    }

    function recordable(obj, fn) {
	    var oldFn = obj[fn];
	    obj[fn] = (function (oldFn) {
	        return function() {
		        rec.steps.push(new Step(this, oldFn, arguments));
		        oldFn.apply(this, arguments);
	        }
	    })(oldFn);
    }
};

Recorder.prototype.stop = function () {
    console.log('record stop');
};

Recorder.prototype.replay = function () {
    console.log('record replay');
    for (var i = 0; i < this.steps.length; i++) {
	    replayStep(this.steps[i]);
    }

    function replayStep(step) {
	    step.fn.apply(step.obj, step.args);
    }
}

var foo = new Foo();

function run() {
    foo.reset();
    for (var i = 0; i < 3; i++) {
	    foo.count();
    }
}

var config = {
    obj: foo,
    fns: ['reset', 'count']
};

var rec = new Recorder(config);

run();
rec.start();
run();
rec.stop();
rec.replay();
