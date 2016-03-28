function NeuroGetRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroGetRemote,
{

  cascading: Neuro.Cascade.Rest,

  interrupts: false,

  type: 'NeuroGetRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( NeuroModel.Events.RemoteGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() )
    {
      db.rest.get( model, this.success(), this.failure() );
    }
    else
    {
      model.$trigger( NeuroModel.Events.RemoteGet, [model] );

      this.finish();
    }
  },

  onSuccess: function(response)
  {
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    if ( isObject( data ) )
    {
      db.putRemoteData( data, model.$key(), model, true );
    }

    Neuro.debug( Neuro.Debugs.GET_REMOTE, model, data );

    model.$trigger( NeuroModel.Events.RemoteGet, [model] );
  },

  onFailure: function(response, status)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_REMOTE_ERROR, model, response, status );

    if ( status === 0 )
    {
      model.$trigger( NeuroModel.Events.RemoteGetOffline, [model, response] );
    }
    else
    {
      model.$trigger( NeuroModel.Events.RemoteGetFailure, [model, response] );
    }
  }

});
