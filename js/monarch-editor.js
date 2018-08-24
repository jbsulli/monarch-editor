require.config({ paths: { 'vs': 'vendor/monaco/vs' }});

function getSelections(cursor) {
  return cursor.getAll().map(function(cursor) {
    var selection = cursor.viewState.selection;
    return [selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn];
  });
}

function htmlEncode(str) {
  return ('' + str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function consoleOut(text) {
  var el = document.getElementById('console');
  el.innerHTML = htmlEncode(text);
}

function time(time) {
  time = time || new Date();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();
  var hours12 = hours % 12;
  return (
    (hours12 === 0 ? 12 : hours12) + ':' +
    minutes + ':' +
    seconds
  );
}

function createLanguageModel(languageId, text, editor) {
  monaco.languages.register({ id: languageId });

  var langModel = monaco.editor.createModel(text, 'javascript');

  function update() {
    var def = null;
    var defStr = langModel.getValue();
    consoleOut('Updating...');
    try {
      def = eval("(function(){ " + defStr + "; })()");
      monaco.languages.setMonarchTokensProvider(languageId, def);
    } catch (err) {
      consoleOut(err);
      return;
    }
    localStorage.setItem(languageId, defStr);
    localStorage.setItem(languageId + '-cursors', JSON.stringify(getSelections(editor.cursor)));
    consoleOut(`Updated ${time()}`);
  }

  langModel.onDidChangeContent(update);
  update();
  return langModel;
}

require(['vs/editor/editor.main'], function() {
    var languageId = 'monarch-language-vengeance';

    var editorDiv = document.getElementById('editor');
    var editor = monaco.editor.create(editorDiv, {
      automaticLayout: true,
      value: [
        'function x() {',
        '\tconsole.log("Hello world!");',
        '}'
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled:false }
    });
    editor.setModel(createLanguageModel(languageId, localStorage.getItem(languageId), editor));
    editor.getModel().updateOptions({ tabSize:2 });
    editor.focus();
    /*editor.cursor.setSelections((JSON.parse(localStorage.getItem(languageId + '-cursors') || []).map(function(selection) {
      return { startLineNumber:selection[0], startColumn:selection[1], endLineNumber:selection[2], endColumn:selection[3] };
    })));*/

    var languagePreviewDiv = document.getElementById('languagePreview');
    var languagePreview = monaco.editor.create(languagePreviewDiv, {
      automaticLayout: true,
      value: '',
      language: 'custom',
      theme: 'vs-dark',
      minimap: { enabled:false },
      model: monaco.editor.createModel('', languageId)
    });
    languagePreview.getModel().updateOptions({ tabSize:2 });

});