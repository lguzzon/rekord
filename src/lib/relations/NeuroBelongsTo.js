function NeuroBelongsTo()
{
}

Neuro.Relations.belongsTo = NeuroBelongsTo;

NeuroBelongsTo.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  local:                null,
  cascade:              Neuro.Cascade.Local,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationSingle, NeuroBelongsTo, 
{

  type: 'belongsTo',

  debugInit:          Neuro.Debugs.BELONGSTO_INIT,
  debugClearModel:    Neuro.Debugs.BELONGSTO_CLEAR_MODEL,
  debugSetModel:      Neuro.Debugs.BELONGSTO_SET_MODEL,
  debugLoaded:        Neuro.Debugs.BELONGSTO_LOADED,
  debugClearKey:      Neuro.Debugs.BELONGSTO_CLEAR_KEY,
  debugUpdateKey:     Neuro.Debugs.BELONGSTO_UPDATE_KEY,
  debugQuery:         Neuro.Debugs.BELONGSTO_QUERY,
  debugQueryResults:  Neuro.Debugs.BELONGSTO_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroBelongsTo.Defaults;
  },

  handleLoad: function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] = 
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_REMOVE, this, model, relation );

        model.$remove( this.cascade );
        this.clearRelated( relation );
      },

      onSaved: function()
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_SAVE, this, model, relation );

        if ( !relation.isRelated( relation.related ) )
        {
          model.$remove( this.cascade );
          this.clearRelated( relation );
        }
      }
    };

    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );
    model.$on( NeuroModel.Events.KeyUpdate, this.onKeyUpdate, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );
      
      if ( initialValue )
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initialValue );        
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
      this.setProperty( relation );
    }
  },

  onKeyUpdate: function(model, related, modelFields, relatedFields)
  {
    if ( this.local === modelFields )
    {
      var relation = model.$relations[ this.name ];

      if ( relation && related !== relation.related )
      {
        this.clearModel( relation );
        this.setModel( relation, related );
        this.setProperty( relation );
      }        
    }
  }

});