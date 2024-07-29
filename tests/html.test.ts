import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { html } from '../mod.ts';

describe('html tag function', () => {
	it('only raw', () => {
		assertEquals(html`<p>Test</p>`, '<p>Test</p>');
	});

	it('insert string value', () => {
		assertEquals(html`<p>${'Test'}</p>`, '<p>Test</p>');
	});

	it('insert number value', () => {
		assertEquals(html`<p>${1}</p>`, '<p>1</p>');
	});

	describe('insert boolean value', () => {
		it('insert true value', () => {
			assertEquals(html`<p>${true}</p>`, '<p>true</p>');
		});

		it('insert false value', () => {
			assertEquals(html`<p>${false}</p>`, '<p>false</p>');
		});
	});

	it('insert null value', () => {
		assertEquals(html`<p>${null}</p>`, '<p>null</p>');
	});

	it('insert undefined value', () => {
		assertEquals(html`<p>${undefined}</p>`, '<p>undefined</p>');
	});

	it('insert function value', () => {
		assertEquals(html`<p>${() => {}}</p>`, '<p>()=>{}</p>');
	});

	describe('insert array value', () => {
		it('insert string array', () => {
			const array = ['A', 'B', 'C'];
			assertEquals(html`<p>${array}</p>`, '<p>ABC</p>');
		});

		it('insert number array', () => {
			const array = [1, 2, 3];
			assertEquals(html`<p>${array}</p>`, '<p>123</p>');
		});

		it('insert boolean array', () => {
			const array = [true, false];
			assertEquals('<p>truefalse</p>', html`<p>${array}</p>`);
		});

		it('insert object array', () => {
			const array = [{ key1: 'value1' }, { key2: 1 }];
			assertEquals(
				html`<p>${array}</p>`,
				'<p>[object Object][object Object]</p>'
			);
		});

		it('insert list item', () => {
			const array = ['A', 1, true, null, undefined, { key: 'value' }];
			assertEquals(
				html`<ul>
					${array.map((item) => html`<li>${item}</li>`)}
				</ul>`,
				'<ul><li>A</li><li>1</li><li>true</li><li>null</li><li>undefined</li><li>[object Object]</li></ul>'
			);
		});
	});

	it('insert multiple value', () => {
		const string = 'Test';
		const number = 1;
		const boolean = false;
		const array = ['string', 1, true, { key: 'value' }];
		const object = { key: 'value' };

		assertEquals(
			html`
				<ul>
					<li>${string}</li>
					<li>${number}</li>
					<li>${boolean}</li>
					<li>${array}</li>
					<li>${object}</li>
				</ul>
			`,
			'<ul><li>Test</li><li>1</li><li>false</li><li>string1true[object Object]</li><li>[object Object]</li></ul>'
		);
	});

	it('do not escape markup', () => {
		const dangerousMarkup = '<script src="inject.js"></script>';
		assertEquals(
			html`<p>${dangerousMarkup}</p>`,
			'<p><script src="inject.js"></script></p>'
		);
	});
});
