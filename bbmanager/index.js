import bs from 'bonescript';

/**
 * bbManager() creates a manager object to interact with the
 * beaglebone black via bonescript. Depending on the configuration
 * it will allow only syncronized access to the beaglebones hardware
 * connections.
 *
 * ```
 * const mgr = bbManager({syncronize: true, maxIdle: 150});
 * // --> mgr will queue in ordered fashion and run one by one,
 * //     if syncronized is true, it will even wait for each work
 * //     to be completely done before spawning the next.
 * await Promise.all(mgr.pin('P9_14').mode(bonescript.OUTPUT), mgr.pin('P9_14').analog.write(0.5, 60))
 * let mv = await mgr.pin('P9_40').analog.read();
 * ```
 *
 */
export function bbManager(options) {

	// get options from param
	options = options || {};
	options.syncronize = options.syncronize === undefined ? true : options.syncronize;
	options.maxIdle = options.maxIdle === undefined ? 150 : options.maxIdle;
	const {syncronize, maxIdle} = options;

	/**
	 * Define queu and queueFunc that will be used
	 * to manage the requested work.
	 *
	 */
	const queue = [];
	function queueFunc(func) {
		// place function on queue and return promise
		// for the done handling. Note that the function
		// has to return a promise (!).
		return new Promise(function(done){
			queue.push([func, done]);
		});
	}

	// spawn worker to process queue
	(async function processor(queue) {
		if (queue.length > 0) {
			// get next function and done handler
			const [func, done] = queue.shift();
			// start processing
			const prom = func();
			// fork promise to call done handler
			prom.then(done); 
			// if sync, await the resolution of the promise
			// not the done handling though (!).
			// Otherwise, just continue to schedule the
			// next iteration.
			if (syncronize) {
				// await execution
				await prom;
			}
		}
		// schedule next iteration
		setTimeout(processor, queue.length === 0 ? maxIdle : 1, queue);
	})(queue);

	/**
	 * Return the interaction points, each of them only allowed to
	 * use queueFunc.
	 *
	 */
	return {
		pin: function(pin) {
			return {
				mode: function(mode) {
					return queueFunc(() => Promise.resolve(bs.pinMode(pin, mode)));
				},
				analog: {
					write: function(dc, freq) {
						return queueFunc(() => new Promise((resolve) => bs.analogWrite(pin, dc, freq, resolve)));
					},
					read: function() {
						// Number from 0 to 1 where 0 is 0V and 1 is the maximum input voltage (1.8V)
						return queueFunc(() => Promise.resolve(bs.analogRead(pin) * 1800));
					}
				}
			}
		}
	}
}
