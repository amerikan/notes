(function () {

    /**
     * Storage operations
     */
    var Storage = {
        /**
         * Saves multiple notes to localStorage
         * @param {Array of Objects} notes
         */
        setNotes: function (notes) {
            localStorage.setItem('notes', JSON.stringify(notes));
        },
        /**
         * Saves a single note
         * @param {Object} note
         */
        setNote: function (note) {
            var currentNotes = this.getAllNotes();

            currentNotes.unshift(note);
            
            localStorage.setItem('notes', JSON.stringify(currentNotes));
        },
        /**
         * Gets all notes from localStorage and returns it
         * @return {Array of Objects} array containing all notes
         */
        getAllNotes: function () {
            if (localStorage.getItem('notes') === null) {
                return [];
            } else {
                return JSON.parse(localStorage.getItem('notes'));
            }
        },
        /**
         * Deletes a note from localStorage having the title specified
         * @param {String} title
         */
        deleteNoteByTitle: function (title) {
            var idx = this._findNoteByTitle(title);
            var currentNotes = this.getAllNotes();

            currentNotes.splice(idx, 1);

            this.setNotes(currentNotes);
        },
        /**
         * Updates a note in localStorage based on the note title
         * @param {Object} title
         */
        updateNoteByTitle: function (title) {
            var idx = this._findNoteByTitle(title.oldTitle);
            var currentNotes = this.getAllNotes();

            currentNotes[idx] = {title: title.newTitle};

            this.setNotes(currentNotes);
        },
        /**
         * Returns the index of the specified title 
         * @param {String} title
         * @return {Number} index
         */
        _findNoteByTitle: function (title) {
            var currentNotes = this.getAllNotes();

            for(var i = 0, ilen = currentNotes.length; i < ilen; i++) {

                if (currentNotes[i].title === title) {
                    return i;
                }
            }
        }
    };

    var NoteBox = React.createClass({
        handleNoteSubmit: function (note) {
            // Save note and update UI
            Storage.setNote(note);
            this.setState({data: Storage.getAllNotes()});
        },
        getInitialState: function() {
            return {data: []};
        },
        componentDidMount: function() {
            // Show current notes
            this.setState({data: Storage.getAllNotes()});
        },
        handleNoteDelete: function(title) {
            // Delete a note and update the UI
            Storage.deleteNoteByTitle(title);
            this.setState({data: Storage.getAllNotes()});
        },
        handleNoteUpdate: function (note) {
            // Update a note and update the UI
            Storage.updateNoteByTitle(note);
            this.setState({data: Storage.getAllNotes()});
        },
        render: function () {
            return (
                <div className="noteBox">
                    <h1>Notes</h1>
                    <NoteForm onNoteSubmit={this.handleNoteSubmit} />
                    <NoteList data={this.state.data} onNoteDelete={this.handleNoteDelete} onNoteUpdate={this.handleNoteUpdate} />
                </div>
            );
        }
    });

    var NoteList = React.createClass({
        handleNoteDelete: function (title) {
            // Parent callback
            this.props.onNoteDelete(title);
            return;
        },
        handleNoteUpdate: function (note) {
            // Parent callback
            this.props.onNoteUpdate(note)
        },
        render: function() {
            var _this = this;
            var noteNodes = this.props.data.map(function (note) {
            return (
                <Note title={note.title} onNoteDelete={_this.handleNoteDelete} onNoteUpdate={_this.handleNoteUpdate} />
            );
        });

        return (
            <ul className="noteList">
                {noteNodes}
            </ul>
        );
      }
    });

    var Note = React.createClass({
        handleDelete: function () {
            // Parent callback
            this.props.onNoteDelete(this.props.title);
            return;
        },
        handleUpdate: function (note) {
            // Toggle visiblity note/update form
            React.findDOMNode(this.refs.title).style.display = '';
            React.findDOMNode(this.refs.updateForm).style.display = 'none';

            this.props.onNoteUpdate(note);
        },
        handleEditClick: function () {
            // Toggle visibility note/update form
            React.findDOMNode(this.refs.title).style.display = 'none';
            React.findDOMNode(this.refs.updateForm).style.display = '';

            // Select all text
            React.findDOMNode(this.refs.updateForm).childNodes[0].select();
        },
        handleBlur: function () {
            // Update input field value
            React.findDOMNode(this.refs.updateForm).childNodes[0].value = this.props.title

            // Toggle visibility note/update form
            React.findDOMNode(this.refs.updateForm).style.display = 'none';
            React.findDOMNode(this.refs.title).style.display = '';
        },
        render: function () {
            return (
                <li className="note">
                    <div className="note-title" ref="title">{this.props.title}</div>

                    <UpdateNoteForm ref="updateForm" onNoteUpdateSubmit={this.handleUpdate} title={this.props.title} onUpdateFormBlur={this.handleBlur} />

                    <div className="button-group">
                        <button className="edit-button" onClick={this.handleEditClick}>Edit</button>
                        <button className="delete-button" onClick={this.handleDelete} title="Delete">X</button>
                    </div>
                </li>
            );
        }
    });

    var UpdateNoteForm = React.createClass({
        getInitialState: function() {
            return {
                value: this.props.title
            };
        },
        handleSubmit: function (e) {
            e.preventDefault();

            // Get value and trim it
            var note = React.findDOMNode(this.refs.note).value.trim();

            if (!note) {
                return;
            }

            // Parent callback
            this.props.onNoteUpdateSubmit({oldTitle: this.props.title, newTitle: note});

            return;
        },
        handleChange: function (evt) {
            // Update input field based on user input
            this.setState({
              value: evt.target.value
            });
        },
        handleBlur: function () {
            // Parent callback
            this.props.onUpdateFormBlur();
        },
        render: function () {
            return (
                <form style={{display:'none'}} className="updateNoteForm" onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="Update note" ref="note" onChange={this.handleChange} onBlur={this.handleBlur} value={this.state.value} />
                </form>
            );
        }
    });

    var NoteForm = React.createClass({
        handleSubmit: function (e) {

            e.preventDefault();

            // Get value and trim it
            var note = React.findDOMNode(this.refs.note).value.trim();

            if (!note) {
                return;
            }

            // Parent callback
            this.props.onNoteSubmit({title: note});
            
            // Clear note form input
            React.findDOMNode(this.refs.note).value = '';

            return;
        },
        handleEnterPress: function (e) {

            if (e.keyCode == 13) {
                this.handleSubmit();

                return false;
            }
        },
        render: function () {
            return (
                <form className="noteForm" onSubmit={this.handleSubmit}>
                    <input type="text" onKeyPress={this.handleEnterPress} placeholder="Enter note" ref="note" />
                    <button type="submit">Go</button>
                </form>
            );
        }
    });

    React.render(<NoteBox />, document.getElementById('notes'));
})();