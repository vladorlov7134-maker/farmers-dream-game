def create_player(db: Session, player_id: int):
    """Создать нового игрока с начальными значениями"""
    db_player = get_player(db, player_id)
    if db_player:
        return db_player

    new_player = Player(
        id=player_id,
        coins=100,  # Начальные 100 монет
        diamonds=0,
        experience=0,
        level=1,  # Начальный 1 уровень
        created_at=datetime.utcnow()
    )

    db.add(new_player)
    db.commit()
    db.refresh(new_player)

    # Создаем начальный инвентарь
    db_inventory = Inventory(
        player_id=player_id,
        seeds={},
        harvest={}
    )
    db.add(db_inventory)
    db.commit()

    return new_player